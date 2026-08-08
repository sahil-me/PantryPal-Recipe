export interface IngredientTip {
  ingredientName: string;
  substitutions: string[];
  storageTip: string;
  shelfLife?: string;
  proTip?: string;
}

export const INGREDIENT_TIPS_CATALOG: Record<string, IngredientTip> = {
  'garlic': {
    ingredientName: 'Garlic',
    substitutions: [
      'Garlic powder (1/8 tsp per clove)',
      'Shallots or Leeks (finely chopped)',
      'Garlic chives',
      'Pinch of Asafoetida (Hing) in oil'
    ],
    storageTip: 'Store whole unpeeled bulbs in a cool, dark, dry basket with good airflow. Avoid plastic bags or refrigeration.',
    shelfLife: '3 - 5 months (whole bulb)',
    proTip: 'Slightly crushing garlic before peeling releases allicin for enhanced aromatic intensity.'
  },
  'olive oil': {
    ingredientName: 'Olive Oil',
    substitutions: [
      'Avocado oil (ideal for high heat)',
      'Melted butter or Ghee',
      'Grapeseed or Sunflower oil'
    ],
    storageTip: 'Keep in a dark glass bottle in a cool pantry away from heat sources and stove light.',
    shelfLife: '12 - 18 months',
    proTip: 'Extra virgin is best for finishing dressings; use regular olive oil for sauteing.'
  },
  'egg': {
    ingredientName: 'Eggs',
    substitutions: [
      'Flax egg (1 tbsp ground flaxseed + 3 tbsp warm water)',
      'Unsweetened applesauce (1/4 cup per egg in baking)',
      'Mashed banana or Commercial egg replacer'
    ],
    storageTip: 'Store in their original carton in the main refrigerator body, not on the door shelf where temperature fluctuates.',
    shelfLife: '3 - 5 weeks',
    proTip: 'Eggs separate easiest when cold, but whip to highest volume at room temperature.'
  },
  'butter': {
    ingredientName: 'Butter',
    substitutions: [
      'Coconut oil (1:1 swap in baking)',
      'Extra virgin olive oil (3/4 tbsp per 1 tbsp butter)',
      'Ghee or Greek yogurt'
    ],
    storageTip: 'Keep tightly wrapped in the fridge. Unsalted butter can be frozen for up to 9 months.',
    shelfLife: '1 - 2 months refrigerated',
    proTip: 'Brown butter slightly in a skillet before baking to unlock rich nutty caramel undertones.'
  },
  'parmesan': {
    ingredientName: 'Parmesan Cheese',
    substitutions: [
      'Pecorino Romano (slightly saltier)',
      'Grana Padano or Asiago',
      'Nutritional yeast + garlic powder (Vegan option)'
    ],
    storageTip: 'Wrap tightly in parchment paper then outer aluminum foil. Store in the refrigerator crisper drawer.',
    shelfLife: '1 - 2 months block',
    proTip: 'Save leftover hard Parmesan rinds in the freezer to simmer into soups and pasta sauces!'
  },
  'soy sauce': {
    ingredientName: 'Soy Sauce',
    substitutions: [
      'Tamari (Gluten-Free 1:1)',
      'Coconut Aminos (Slightly sweeter)',
      'Liquid Aminos or Worcestershire + splash of water'
    ],
    storageTip: 'Unopened in pantry indefinitely. Refrigerate after opening to preserve peak umami aroma.',
    shelfLife: '1 - 2 years refrigerated',
    proTip: 'Add a splash near the very end of cooking to preserve fresh, aromatic notes.'
  },
  'tomato': {
    ingredientName: 'Tomatoes / Tomato Paste',
    substitutions: [
      'Crushed canned tomatoes simmered down',
      'Fresh pureed plum tomatoes + pinch of sugar',
      'Ketchup or Roasted red pepper paste'
    ],
    storageTip: 'Never store fresh tomatoes in the fridge—cold breaks down cell walls making them mealy. Store stem-side down at room temp.',
    shelfLife: '1 week (room temp)',
    proTip: 'Saute tomato paste in olive oil for 2 minutes until dark brick red before adding liquids to caramelize.'
  },
  'flour': {
    ingredientName: 'All-Purpose Flour',
    substitutions: [
      '1:1 Gluten-Free baking blend',
      'Oat flour (blend rolled oats to fine powder)',
      'Whole wheat flour (use 25% less by volume)'
    ],
    storageTip: 'Transfer to an airtight glass or plastic container in a cool, dark pantry or freezer to prevent pantry pests.',
    shelfLife: '6 - 8 months pantry / 1 year frozen',
    proTip: 'Always spoon flour into measuring cups and level off—never scoop directly from bag to avoid dense baked goods.'
  },
  'milk': {
    ingredientName: 'Milk',
    substitutions: [
      'Oat milk or Almond milk (1:1)',
      'Soy milk (closest protein match)',
      'Heavy cream or Evaporated milk diluted 50/50 with water'
    ],
    storageTip: 'Keep stored on middle or bottom fridge shelves below 40°F (4°C). Avoid storing in refrigerator doors.',
    shelfLife: '7 - 10 days past printed date',
    proTip: 'Bring milk to room temperature before stirring into hot sauces to prevent curdling.'
  },
  'lemon': {
    ingredientName: 'Lemon / Lemon Juice',
    substitutions: [
      'Lime juice (1:1 ratio)',
      'White wine vinegar or Apple cider vinegar (use 1/2 amount)',
      'Citric acid powder (1/4 tsp = 1 tbsp juice)'
    ],
    storageTip: 'Whole lemons last 1 week at room temp, or up to 1 month in a sealed plastic bag in the fridge crisper.',
    shelfLife: '3 - 4 weeks refrigerated',
    proTip: 'Roll lemons firmly on countertop under your palm before squeezing to yield maximum juice.'
  },
  'chicken': {
    ingredientName: 'Chicken Breast / Thighs',
    substitutions: [
      'Turkey breast tenderloin',
      'Pork loin chops',
      'Firm Tofu, Tempeh, or Seitan (Plant-based)'
    ],
    storageTip: 'Keep raw poultry in original packaging on the lowest fridge shelf in a tray to prevent cross-contamination dripping.',
    shelfLife: '1 - 2 days fridge / 9 months frozen',
    proTip: 'Pat raw chicken dry with paper towels before searing to guarantee a golden caramelized crust.'
  },
  'pasta': {
    ingredientName: 'Pasta / Spaghetti',
    substitutions: [
      'Gluten-free chickpea or brown rice pasta',
      'Zucchini noodles (Zoodles)',
      'Spaghetti squash'
    ],
    storageTip: 'Dry pasta should be stored in an airtight container in a cool, dark cupboard.',
    shelfLife: '1 - 2 years dry',
    proTip: 'Always save 1/2 cup of starchy pasta boiling water to emulsify sauces into glossy silk.'
  },
  'onion': {
    ingredientName: 'Onion',
    substitutions: [
      'Shallots or Leeks',
      'Green onions / Scallions',
      'Onion powder (1 tbsp = 1 medium onion)'
    ],
    storageTip: 'Store whole unpeeled onions in a dry, dark, well-ventilated space. Keep separate from potatoes!',
    shelfLife: '2 - 3 months pantry',
    proTip: 'Chill onions in the fridge 30 mins before slicing to significantly reduce crying fumes.'
  },
  'rice': {
    ingredientName: 'Rice / Basmati Rice',
    substitutions: [
      'Jasmine rice or Brown rice',
      'Cauliflower rice (Low-carb option)',
      'Quinoa or Couscous'
    ],
    storageTip: 'Store uncooked grains in an airtight container in a dark pantry. Freeze brown rice for extended freshness.',
    shelfLife: '2+ years (white rice)',
    proTip: 'Rinse rice thoroughly in cold water until it runs clear to wash away excess surface starch for fluffy separate grains.'
  },
  'honey': {
    ingredientName: 'Honey',
    substitutions: [
      'Pure Maple syrup (1:1 ratio)',
      'Agave nectar',
      'Brown sugar dissolved in equal parts warm water'
    ],
    storageTip: 'Keep tightly sealed at room temperature in a dark pantry. Never refrigerate as cold speeds crystallization.',
    shelfLife: 'Indefinite (does not spoil)',
    proTip: 'If honey crystallizes over time, submerge sealed glass jar in a warm water bath until clear again.'
  }
};

/**
 * Normalizes an ingredient name and finds matching tip or generates smart fallback.
 */
export function getIngredientTip(ingredientName: string): IngredientTip {
  const normalized = ingredientName.toLowerCase().trim();

  // Direct key lookup
  for (const [key, tip] of Object.entries(INGREDIENT_TIPS_CATALOG)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return tip;
    }
  }

  // Common word matching
  if (normalized.includes('cheese') || normalized.includes('mozzarella') || normalized.includes('cheddar')) {
    return {
      ingredientName,
      substitutions: ['Gouda or Monterey Jack', 'Provolone', 'Nutritional yeast for dairy-free cheese flavor'],
      storageTip: 'Wrap firmly in wax paper then foil in the vegetable drawer. Avoid tight plastic wrap.',
      shelfLife: '2 - 4 weeks refrigerated'
    };
  }

  if (normalized.includes('oil') || normalized.includes('fat')) {
    return {
      ingredientName,
      substitutions: ['Avocado oil', 'Vegetable or Canola oil', 'Melted butter or Ghee'],
      storageTip: 'Keep in a sealed container in a cool, dark pantry away from stove heat.',
      shelfLife: '1 year'
    };
  }

  if (normalized.includes('sauce') || normalized.includes('vinegar')) {
    return {
      ingredientName,
      substitutions: ['Apple cider vinegar or Red wine vinegar', 'Lemon juice', 'Diluted citrus juice'],
      storageTip: 'Store in a cool pantry or refrigerate after opening to preserve acidity and delicate flavors.',
      shelfLife: '1 - 2 years'
    };
  }

  if (normalized.includes('herb') || normalized.includes('parsley') || normalized.includes('basil') || normalized.includes('cilantro') || normalized.includes('rosemary') || normalized.includes('thyme') || normalized.includes('oregano')) {
    return {
      ingredientName,
      substitutions: ['Dried equivalent (use 1/3 amount of fresh)', 'Fresh chives or Oregano', 'Microgreens'],
      storageTip: 'Trim stems and place upright like flowers in a jar with 1 inch of water, loosely covered in fridge.',
      shelfLife: '1 - 2 weeks refrigerated',
      proTip: 'Add tender fresh herbs at the very end of cooking to keep bright colors and vibrant flavors.'
    };
  }

  if (normalized.includes('spice') || normalized.includes('pepper') || normalized.includes('chili') || normalized.includes('salt')) {
    return {
      ingredientName,
      substitutions: ['Smoked paprika or Red pepper flakes', 'Black pepper + garlic salt', 'Custom spice blend'],
      storageTip: 'Store ground spices in airtight glass containers away from heat and moisture above stove.',
      shelfLife: '1 - 3 years'
    };
  }

  // Smart generic fallback
  return {
    ingredientName,
    substitutions: [
      `Similar regional alternative in your pantry`,
      `Neutral oil or broth as binder`,
      `Seasonal equivalent produce`
    ],
    storageTip: `Store in an airtight container in a cool, dark pantry or refrigerator crisper drawer.`,
    shelfLife: '1 - 2 weeks refrigerated',
    proTip: `Taste as you cook and adjust seasoning progressively.`
  };
}
