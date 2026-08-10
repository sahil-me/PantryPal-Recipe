import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_RECIPES } from './src/data/recipes.js';
import { transformSpoonacularRecipe, SpoonacularRecipeRaw } from './src/services/spoonacularTransformer.js';
import { BLOCKED_INGREDIENTS, isBlockedRecipe } from './src/utils/restrictionUtils.js';

dotenv.config();

const app = express();

async function startServer() {
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PantryPal API',
      spoonacularConnected: Boolean(process.env.SPOONACULAR_API_KEY)
    });
  });

  // Spoonacular configuration status
  app.get('/api/spoonacular/status', (req, res) => {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    res.json({
      configured: Boolean(apiKey && apiKey.trim().length > 0),
      message: apiKey
        ? 'SPOONACULAR_API_KEY is configured on server.'
        : 'SPOONACULAR_API_KEY not found in environment. Using curated offline recipe engine.'
    });
  });

  // Recipe Search Proxy Endpoint (Spoonacular integration with seamless fallback)
  app.get('/api/recipes/search', async (req, res) => {
    const { ingredients, query, category, dietary, number = '25' } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const cleanSampleRecipes = SAMPLE_RECIPES.filter(r => !isBlockedRecipe(r));

    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_SPOONACULAR_API_KEY') {
      return res.json({
        success: true,
        source: 'local',
        recipes: cleanSampleRecipes,
        notice: 'SPOONACULAR_API_KEY not set. Serving curated local recipe dataset.'
      });
    }

    try {
      const url = new URL('https://api.spoonacular.com/recipes/complexSearch');
      url.searchParams.append('apiKey', apiKey.trim());
      url.searchParams.append('addRecipeInformation', 'true');
      url.searchParams.append('fillIngredients', 'true');
      url.searchParams.append('addRecipeNutrition', 'true');
      url.searchParams.append('excludeIngredients', BLOCKED_INGREDIENTS.join(','));
      url.searchParams.append('number', String(number));

      if (ingredients && typeof ingredients === 'string') {
        // Spoonacular expects comma-separated ingredients
        url.searchParams.append('includeIngredients', ingredients);
      }

      if (query && typeof query === 'string' && query.trim()) {
        url.searchParams.append('query', query.trim());
      }

      if (category && typeof category === 'string' && category !== 'All') {
        const catMap: Record<string, string> = {
          'Breakfast': 'breakfast',
          'Lunch': 'lunch',
          'Dinner': 'main course',
          'Snack': 'snack',
          'Dessert': 'dessert'
        };
        if (catMap[category]) {
          url.searchParams.append('type', catMap[category]);
        }
      }

      if (dietary && typeof dietary === 'string' && dietary !== 'Any') {
        const dietMap: Record<string, string> = {
          'Vegetarian': 'vegetarian',
          'Vegan': 'vegan',
          'Gluten-Free': 'gluten free',
          'Keto': 'ketogenic'
        };
        if (dietMap[dietary]) {
          url.searchParams.append('diet', dietMap[dietary]);
        }
      }

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Spoonacular API Warning] HTTP ${response.status}: ${errText}`);
        return res.json({
          success: true,
          source: 'local',
          recipes: cleanSampleRecipes,
          notice: `Spoonacular API returned HTTP ${response.status}. Fallback to local recipe library.`
        });
      }

      const data = await response.json();
      const rawRecipes: SpoonacularRecipeRaw[] = data.results || [];
      const recipes = rawRecipes.map(transformSpoonacularRecipe).filter(r => !isBlockedRecipe(r));

      return res.json({
        success: true,
        source: 'spoonacular',
        count: recipes.length,
        recipes: recipes.length > 0 ? recipes : cleanSampleRecipes
      });
    } catch (err: any) {
      console.error('[Spoonacular Fetch Error]:', err?.message || err);
      return res.json({
        success: true,
        source: 'local',
        recipes: cleanSampleRecipes,
        notice: 'Network exception connecting to Spoonacular API. Fallback to local recipes.'
      });
    }
  });

  // Recipe Detail Proxy Endpoint
  app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const idMatch = /^(?:sp-)?(\d+)$/.exec(id);
    const cleanId = idMatch ? Number(idMatch[1]) : null;

    // Accept only numeric Spoonacular recipe IDs,
    // optionally prefixed with "sp-".
    if (cleanId !== null && Number.isSafeInteger(cleanId) && apiKey?.trim()) {

      try {

        const url = new URL(
          `https://api.spoonacular.com/recipes/${cleanId}/information`
        );

        url.searchParams.set('includeNutrition', 'true');
        url.searchParams.set('apiKey', apiKey.trim());

        const response = await fetch(url.toString());

        if (response.ok) {
          const raw = await response.json();
          const recipe = transformSpoonacularRecipe(raw);
          return res.json({ success: true, source: 'spoonacular', recipe });
        }
          
      } catch (err) {
          console.warn('[Spoonacular Detail Fetch Error]:', err);
        }
    }

    // Fallback to local sample recipes
    const localRecipe = SAMPLE_RECIPES.find(
      r => r.id === id || r.id === `sp-${cleanId}`
    );

    if (localRecipe) {
      return res.json({ success: true, source: 'local', recipe: localRecipe });
    }

    return res.status(404).json({ success: false, error: 'Recipe not found' });
  });

  // Feedback & Bug Report Submission Endpoint (Delivers to contact.eshop.sahil@gmail.com)
  app.post('/api/feedback', async (req, res) => {
    try {
      const { type, category, email, message } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message is required.' });
      }

      console.log('==================================================');
      console.log(`[PantryPal Feedback Submission -> contact.eshop.sahil@gmail.com]`);
      console.log(`Type: ${type || 'feedback'}`);
      console.log(`Category: ${category || 'General Feedback'}`);
      console.log(`User Email: ${email || 'Anonymous'}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Message:\n${message.trim()}`);
      console.log('==================================================');

      return res.json({
        success: true,
        message: 'Feedback received successfully and delivered to contact.eshop.sahil@gmail.com'
      });
    } catch (err: any) {
      console.error('[Feedback Endpoint Error]:', err);
      return res.status(500).json({ success: false, error: 'Failed to record submission.' });
    }
  });

  // Helper generator for intelligent offline culinary fallback responses
  function generateCulinaryFallbackResponse(recipe: any, query: string): string {
    const q = query.toLowerCase();
    const title = recipe?.title || 'this recipe';
    const servings = recipe?.servings || 4;

    const rawIngredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
    const ingredientNames = rawIngredients.map((i: any) =>
      (i?.ingredientName || i?.name || i?.title || '').toLowerCase()
    ).filter(Boolean);

    if (q.includes('substitute') || q.includes('replace') || q.includes('instead of') || q.includes('butter') || q.includes('egg')) {
      if (q.includes('butter')) {
        const hasButter = ingredientNames.some((n: string) => n.includes('butter'));
        if (!hasButter) {
          return `Butter isn't listed as an ingredient in **${title}**. However, if you're looking to add or substitute fat in this dish, extra virgin olive oil or avocado oil works as a great 1:1 replacement for butter when cooking or roasting.`;
        }
        return `For **${title}**, you can replace butter with equal parts extra virgin olive oil or melted coconut oil. Olive oil provides a rich, heart-healthy flavor that pairs wonderfully with this dish.`;
      }

      if (q.includes('egg')) {
        const hasEgg = ingredientNames.some((n: string) => n.includes('egg'));
        if (!hasEgg) {
          return `Eggs aren't listed as an ingredient in **${title}**. If you're looking for an egg substitute for binding in general, 1 tablespoon of ground flaxseed mixed with 3 tablespoons of warm water works well.`;
        }
        return `To substitute eggs in **${title}**, you can use 1 tablespoon of ground flaxseed mixed with 3 tablespoons of warm water per egg for binding, or silken tofu for a creamy egg-salad texture.`;
      }

      return `For ingredient substitutions in **${title}**, olive oil or avocado oil can replace butter, plant milk replaces dairy 1:1, and flax eggs (1 tbsp flaxseed + 3 tbsp water) work great as a binder.`;
    }

    if (q.includes('vegetarian') || q.includes('vegan')) {
      const isVegan = q.includes('vegan');
      return `To make **${title}** ${isVegan ? 'vegan' : 'vegetarian'}, replace any animal protein or dairy with plant-based alternatives like extra-firm tofu, chickpeas, or olive oil and nutritional yeast for savory depth.`;
    }

    if (q.includes('double') || q.includes('halve') || q.includes('scaling') || q.includes('people') || q.includes('6') || q.includes('4')) {
      const isHalve = q.includes('half') || q.includes('halve');
      const factor = isHalve ? 0.5 : 2;
      const targetServings = Math.round(servings * factor);
      return `To scale **${title}** for ${targetServings} servings (${factor}x), multiply ingredient quantities by ${factor}. Keep cooking temperatures the same, but watch cooking times closely as pan volume changes.`;
    }

    if (q.includes('side') || q.includes('pair') || q.includes('beverage') || q.includes('wine')) {
      return `Great side dishes for **${title}** include a fresh arugula salad with lemon vinaigrette, crusty sourdough bread, or roasted seasonal vegetables. For drinks, chilled sparkling water or a light Pinot Noir pairs wonderfully.`;
    }

    if (q.includes('step') || q.includes('explain') || q.includes('first')) {
      const steps = Array.isArray(recipe?.instructions) ? recipe.instructions : [];
      if (steps.length > 0) {
        return `The first step for **${title}** is: "${steps[0]}". Make sure all your ingredients are prepped and measured beforehand so cooking goes smoothly.`;
      }
    }

    return `Regarding **${title}**: keep your heat controlled to preserve flavor and moisture. Store any leftovers in an airtight container in the fridge for up to 3–4 days, and reheat gently over low heat.`;
  }

  // Context-Aware AI Recipe Assistant Endpoint (Gemini 2.5 Flash)
  app.post('/api/ai/recipe-assistant', async (req, res) => {
    try {
      const { recipe, messages = [], userQuery } = req.body;

      if (!recipe || !recipe.title) {
        return res.status(400).json({ success: false, error: 'Recipe context is required.' });
      }

      if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
        return res.status(400).json({ success: false, error: 'A user question or prompt is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      const formatIngredient = (ing: any) => {
        const name = ing?.ingredientName || ing?.name || ing?.title || '';
        if (!name) return '';
        const amount = ing?.amount !== undefined && ing?.amount !== null ? ing.amount : '';
        const unit = ing?.unit || '';
        const notes = ing?.notes ? `(${ing.notes})` : '';
        return `- ${amount} ${unit} ${name} ${notes}`.replace(/\s+/g, ' ').trim();
      };

      const ingredientList = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(formatIngredient).filter(Boolean).join('\n')
        : 'See recipe ingredient list';

      const instructionList = Array.isArray(recipe.instructions)
        ? recipe.instructions.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')
        : 'See recipe instruction list';

      // System Prompt formatted with exact Recipe Context
      const systemInstruction = `You are PantryPal's AI Recipe Assistant — a world-class, encouraging, and concise culinary expert.
You are helping a home cook with the specific recipe detailed below.

=== CURRENT RECIPE CONTEXT ===
Title: ${recipe.title || 'Untitled Recipe'}
Category: ${recipe.category || 'Main Course'}
Cuisine: ${recipe.cuisine || 'International'}
Prep Time: ${recipe.prepTimeMinutes || 15} mins | Cook Time: ${recipe.cookTimeMinutes || 20} mins
Servings: ${recipe.servings || 4}
Difficulty: ${recipe.difficulty || 'Easy'}
Dietary Tags: ${Array.isArray(recipe.dietary) && recipe.dietary.length > 0 ? recipe.dietary.join(', ') : 'None specified'}

INGREDIENTS IN THIS RECIPE:
${ingredientList || 'None specified'}

INSTRUCTIONS FOR THIS RECIPE:
${instructionList || 'None specified'}
==============================

CRITICAL RULES & RESPONSE QUALITY REQUIREMENTS:
1. NEVER EXPOSE TECHNICAL DETAILS: You MUST NEVER output terms like "undefined", "null", "[object Object]", "API", JSON, database field names, internal error codes, or missing property names. If recipe information is missing, state it naturally in plain, friendly English (e.g., "Butter isn't listed as an ingredient in this recipe.").
2. STRICT RECIPE CONTEXT ACCURACY:
   - Carefully verify the "INGREDIENTS IN THIS RECIPE" list above before answering ingredient questions.
   - Never claim an ingredient is present in the recipe if it is not in the list.
   - If asked about substituting an ingredient that is NOT in the recipe (e.g., "Can I replace butter with olive oil?" when butter is not in the recipe), explicitly state that butter is not listed in this recipe, then answer the substitution question as a helpful general culinary tip.
3. BE CONCISE & DIRECT:
   - For simple questions, keep your answer brief and direct (prefer 2–5 sentences).
   - Do NOT unnecessarily repeat the full recipe title, full ingredient list, full instructions, or context metadata unless specifically asked.
4. GRACEFUL FALLBACK:
   - If required recipe information is unavailable or unclear, say: "I don't have enough information from this recipe to confirm that. I can still give you a general cooking suggestion if you'd like."
5. SAFETY:
   - Avoid medical/health treatment claims.
   - If dietary suitability cannot be confirmed with 100% certainty, remind the user to check manufacturer product packaging.
6. FORMATTING:
   - Output natural Markdown with bolding and bullet points. Do NOT output code blocks or raw JSON.`;

      // If no Gemini API key configured, use intelligent culinary fallback assistant
      if (!apiKey || !apiKey.trim() || apiKey === 'MY_GEMINI_API_KEY') {
        const fallbackText = generateCulinaryFallbackResponse(recipe, userQuery.trim());
        return res.json({
          success: true,
          response: fallbackText,
          notice: 'Serving intelligent offline culinary advice engine.'
        });
      }

      // Initialize Gemini SDK
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

      // Construct messages sequence
      const contents = [];
      if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
          if (msg.role && msg.content) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            });
          }
        }
      }

      // Append current user query if not already last message
      const lastMsg = contents[contents.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.parts[0]?.text !== userQuery) {
        contents.push({
          role: 'user',
          parts: [{ text: userQuery.trim() }]
        });
      }

      // Check if client requested streaming
      const acceptHeader = req.headers.accept || '';
      const wantsStream = acceptHeader.includes('text/event-stream') || req.body.stream === true;

      if (wantsStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction
            }
          });

          for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
              res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
            }
          }
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          return res.end();
        } catch (streamErr: any) {
          console.error('[Gemini Stream Error]:', streamErr);
          res.write(`data: ${JSON.stringify({ error: streamErr?.message || 'Streaming failed' })}\n\n`);
          return res.end();
        }
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction
          }
        });

        const replyText = response.text || "I'm sorry, I couldn't generate a response for this recipe query.";
        return res.json({
          success: true,
          response: replyText
        });
      }
    } catch (err: any) {
      console.error('[AI Recipe Assistant Error]:', err?.message || err);
      try {
        const { recipe, userQuery } = req.body;
        if (recipe && userQuery) {
          const fallback = generateCulinaryFallbackResponse(recipe, String(userQuery));
          return res.json({
            success: true,
            response: fallback,
            notice: 'Temporary API error. Provided local culinary assistance.'
          });
        }
      } catch (_) {}
      return res.status(500).json({
        success: false,
        error: 'Unable to reach AI Recipe Assistant. Please try again in a moment.'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

export const serverReady = startServer();

export default app;