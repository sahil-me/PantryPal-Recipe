import { Recipe } from '../types';

const oatsImg = 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&auto=format&fit=crop&q=80';
const aglioOlioImg = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?w=800&auto=format&fit=crop&q=80';
const shrimpImg = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80';

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Classic Garlic & Herb Fried Eggs',
    description: 'Crispy-edged eggs fried in fragrant garlic butter with chili flakes and fresh herbs on toasted bread.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 2,
    difficulty: 'Easy',
    category: 'Breakfast',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-16', ingredientName: 'Eggs', amount: 4, unit: 'whole' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 2, unit: 'cloves, minced' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 2, unit: 'tbsp' },
      { ingredientId: 'ing-35', ingredientName: 'Bread', amount: 2, unit: 'slices' },
      { ingredientId: 'ing-53', ingredientName: 'Chili Flakes', amount: 0.5, unit: 'tsp', optional: true },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 0.25, unit: 'tsp' },
      { ingredientId: 'ing-47', ingredientName: 'Black Pepper', amount: 0.25, unit: 'tsp' }
    ],
    instructions: [
      'Melt butter in a non-stick skillet over medium-low heat.',
      'Add minced garlic and chili flakes; sauté for 1 minute until fragrant but not brown.',
      'Crack the eggs into the pan right over the garlic butter.',
      'Cook for 3-4 minutes until egg whites are set and edges are crisp.',
      'Season with salt and black pepper.',
      'Serve warm over toasted slices of bread.'
    ],
    tags: ['Quick', 'High Protein', 'Under 10 mins'],
    dietary: ['Vegetarian'],
    calories: 380,
    nutrition: { calories: 380, protein: 22, carbs: 28, fats: 20, fiber: 3, sodium: 480 }
  },
  {
    id: 'rec-2',
    title: 'Spaghetti Aglio e Olio',
    description: 'The ultimate Roman staple: tender pasta tossed with golden sizzled garlic, extra virgin olive oil, and chili flakes.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Italian',
    imageUrl: aglioOlioImg,
    ingredients: [
      { ingredientId: 'ing-33', ingredientName: 'Spaghetti', amount: 200, unit: 'g' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 5, unit: 'cloves, sliced' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 4, unit: 'tbsp' },
      { ingredientId: 'ing-53', ingredientName: 'Chili Flakes', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-20', ingredientName: 'Parmesan Cheese', amount: 30, unit: 'g', optional: true },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 1, unit: 'tsp' }
    ],
    instructions: [
      'Bring a large pot of heavily salted water to a boil. Cook spaghetti until 1 minute shy of al dente.',
      'While pasta cooks, heat olive oil in a large skillet over medium-low heat.',
      'Add thin garlic slices and chili flakes. Cook gently for 3 minutes until garlic turns pale golden.',
      'Transfer pasta directly into the garlic oil along with 1/2 cup of starchy pasta cooking water.',
      'Toss vigorously for 1-2 minutes until emulsified into a glossy sauce.',
      'Optionally top with grated Parmesan cheese before serving.'
    ],
    tags: ['Pantry Favorite', 'Classic Italian', 'Under 15 mins'],
    dietary: ['Vegetarian', 'Dairy-Free'],
    calories: 460,
    nutrition: { calories: 460, protein: 12, carbs: 62, fats: 18, fiber: 4, sodium: 390 }
  },
  {
    id: 'rec-3',
    title: 'Golden Garlic Butter Chicken & Rice',
    description: 'Juicy skillet chicken breasts seared in garlic butter, served over fluffy rice with seasoned spinach.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 3,
    difficulty: 'Medium',
    category: 'Dinner',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-24', ingredientName: 'Chicken Breast', amount: 400, unit: 'g' },
      { ingredientId: 'ing-32', ingredientName: 'White Rice', amount: 1.5, unit: 'cups' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 4, unit: 'cloves' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 2, unit: 'tbsp' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 1, unit: 'tbsp' },
      { ingredientId: 'ing-4', ingredientName: 'Spinach', amount: 100, unit: 'g' },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-47', ingredientName: 'Black Pepper', amount: 0.5, unit: 'tsp' },
      { ingredientId: 'ing-51', ingredientName: 'Paprika', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Rinse rice and cook according to package directions.',
      'Season chicken breast cutlets generously with salt, pepper, and paprika.',
      'Heat oil and 1 tbsp butter in a skillet over medium-high heat. Sear chicken for 5-6 mins per side until golden cooked through.',
      'Reduce heat to low, add remaining butter, minced garlic, and spinach to pan juices until spinach wilts.',
      'Spoon garlic butter sauce over chicken cutlets and serve alongside warm rice.'
    ],
    tags: ['High Protein', 'Family Friendly', 'One Pan'],
    dietary: ['Gluten-Free'],
    calories: 520,
    nutrition: { calories: 520, protein: 42, carbs: 48, fats: 16, fiber: 3, sodium: 540 }
  },
  {
    id: 'rec-4',
    title: 'Savory Spinach & Cheese Omelet',
    description: 'Fluffy 3-egg folded omelet packed with sautéed spinach, garlic, and gooey melted cheddar cheese.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 6,
    servings: 1,
    difficulty: 'Easy',
    category: 'Breakfast',
    cuisine: 'French',
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-16', ingredientName: 'Eggs', amount: 3, unit: 'whole' },
      { ingredientId: 'ing-4', ingredientName: 'Spinach', amount: 60, unit: 'g' },
      { ingredientId: 'ing-19', ingredientName: 'Cheddar Cheese', amount: 40, unit: 'g, shredded' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 1, unit: 'tbsp' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 1, unit: 'clove, minced' },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 0.25, unit: 'tsp' }
    ],
    instructions: [
      'In a bowl, whisk eggs with salt and 1 tbsp water until fluffy.',
      'Melt half the butter in a pan over medium heat; sauté garlic and spinach for 1 minute until wilted. Remove and set aside.',
      'Melt remaining butter in the skillet over medium-low heat.',
      'Pour whisked eggs into the pan. As edges set, gently push cooked egg toward center.',
      'When egg is almost set on top, add sautéed spinach and cheddar cheese to one half.',
      'Fold omelet over, cook 1 minute until cheese melts, and serve.'
    ],
    tags: ['Keto Friendly', 'High Protein', 'Fast Prep'],
    dietary: ['Vegetarian', 'Gluten-Free', 'Keto'],
    calories: 410
  },
  {
    id: 'rec-5',
    title: 'Creamy Tomato & Basil Penne Pasta',
    description: 'Rich tomato pasta sauce seasoned with garlic, cream, and fresh basil, tossed with penne pasta.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 3,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-34', ingredientName: 'Penne Pasta', amount: 250, unit: 'g' },
      { ingredientId: 'ing-3', ingredientName: 'Tomatoes', amount: 3, unit: 'medium, chopped' },
      { ingredientId: 'ing-56', ingredientName: 'Tomato Paste', amount: 2, unit: 'tbsp' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 3, unit: 'cloves' },
      { ingredientId: 'ing-22', ingredientName: 'Heavy Cream', amount: 100, unit: 'ml' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 2, unit: 'tbsp' },
      { ingredientId: 'ing-13', ingredientName: 'Basil', amount: 1, unit: 'handful' },
      { ingredientId: 'ing-20', ingredientName: 'Parmesan Cheese', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Boil penne pasta in salted water until al dente.',
      'Sauté garlic in olive oil for 1 minute. Add chopped tomatoes and tomato paste; simmer for 8 minutes until softened.',
      'Stir in heavy cream and fresh basil leaves; season with salt and pepper.',
      'Add cooked penne into sauce with 1/4 cup pasta water and toss.',
      'Serve sprinkled generously with grated Parmesan cheese.'
    ],
    tags: ['Comfort Food', 'Vegetarian Delight'],
    dietary: ['Vegetarian'],
    calories: 510
  },
  {
    id: 'rec-6',
    title: 'Zesty Garlic Butter Shrimp Skillet',
    description: 'Plump succulent shrimp sautéed in a lemon-garlic butter glaze with fresh parsley and chili flakes.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 6,
    servings: 2,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    imageUrl: shrimpImg,
    ingredients: [
      { ingredientId: 'ing-30', ingredientName: 'Shrimp', amount: 300, unit: 'g, peeled' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 4, unit: 'cloves, minced' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-5', ingredientName: 'Lemon', amount: 1, unit: 'whole (juice)' },
      { ingredientId: 'ing-53', ingredientName: 'Chili Flakes', amount: 0.5, unit: 'tsp' },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Melt butter in a skillet over medium-high heat.',
      'Add minced garlic and chili flakes; cook for 30 seconds until fragrant.',
      'Add shrimp in a single layer. Cook for 2 minutes per side until pink and opaque.',
      'Squeeze fresh lemon juice over the shrimp and toss to coat.',
      'Serve hot as a main dish or over rice/pasta.'
    ],
    tags: ['Seafood', 'Keto', 'Under 15 mins'],
    dietary: ['Gluten-Free', 'Keto'],
    calories: 340
  },
  {
    id: 'rec-7',
    title: 'Loaded Avocado Egg Toast',
    description: 'Creamy mashed avocado seasoned with lemon juice and black pepper on toasted sourdough, topped with poached or fried eggs.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 2,
    difficulty: 'Easy',
    category: 'Breakfast',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-9', ingredientName: 'Avocado', amount: 1, unit: 'ripe' },
      { ingredientId: 'ing-35', ingredientName: 'Bread', amount: 2, unit: 'slices' },
      { ingredientId: 'ing-16', ingredientName: 'Eggs', amount: 2, unit: 'whole' },
      { ingredientId: 'ing-5', ingredientName: 'Lemon', amount: 0.5, unit: 'juice' },
      { ingredientId: 'ing-53', ingredientName: 'Chili Flakes', amount: 0.25, unit: 'tsp', optional: true },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 0.25, unit: 'tsp' }
    ],
    instructions: [
      'Toast bread slices until golden brown.',
      'In a bowl, mash avocado with lemon juice, salt, and pepper.',
      'Fry eggs in a pan to your desired runny yolk consistency.',
      'Spread mashed avocado over toasted bread and place eggs on top.',
      'Garnish with chili flakes if desired and enjoy.'
    ],
    tags: ['Trendy', 'Quick Breakfast', 'Healthy Fats'],
    dietary: ['Vegetarian', 'Dairy-Free'],
    calories: 390
  },
  {
    id: 'rec-8',
    title: 'Speedy Chicken & Veggie Stir-Fry',
    description: 'Tender sliced chicken breast stir-fried with bell peppers, broccoli, ginger, garlic, and savory soy sauce.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 3,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Asian',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-24', ingredientName: 'Chicken Breast', amount: 350, unit: 'g, sliced' },
      { ingredientId: 'ing-6', ingredientName: 'Bell Pepper', amount: 1, unit: 'sliced' },
      { ingredientId: 'ing-10', ingredientName: 'Broccoli', amount: 1.5, unit: 'cups florets' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 3, unit: 'cloves' },
      { ingredientId: 'ing-11', ingredientName: 'Ginger', amount: 1, unit: 'tsp minced' },
      { ingredientId: 'ing-40', ingredientName: 'Soy Sauce', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-44', ingredientName: 'Honey', amount: 1, unit: 'tbsp' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: [
      'Whisk soy sauce and honey in a small bowl.',
      'Heat oil in a wok or large skillet over high heat. Add chicken cutlets and cook 5 minutes until browned. Set aside.',
      'Add garlic, ginger, bell pepper, and broccoli to pan; stir-fry 3 minutes.',
      'Return chicken to skillet, pour sauce over top, and toss until glossy and well combined.',
      'Serve hot over rice or noodles.'
    ],
    tags: ['High Protein', 'Healthy', 'Color Burst'],
    dietary: ['Dairy-Free'],
    calories: 420
  },
  {
    id: 'rec-9',
    title: 'Classic Crispy Grilled Cheese',
    description: 'Golden buttery toasted bread sandwich bursting with warm stringy melted cheddar cheese.',
    prepTimeMinutes: 3,
    cookTimeMinutes: 5,
    servings: 1,
    difficulty: 'Easy',
    category: 'Snack',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-35', ingredientName: 'Bread', amount: 2, unit: 'slices' },
      { ingredientId: 'ing-19', ingredientName: 'Cheddar Cheese', amount: 2, unit: 'thick slices' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: [
      'Butter one side of each slice of bread.',
      'Place one slice buttered-side down in a skillet over low-medium heat.',
      'Top with cheddar cheese slices, then cover with the second slice of bread (buttered side facing up).',
      'Cook for 3 minutes until deep golden brown on bottom. Flip gently and cook another 2 minutes until cheese melts completely.',
      'Slice diagonally and serve piping hot.'
    ],
    tags: ['Ultimate Comfort', '3 Ingredients', 'Kid Friendly'],
    dietary: ['Vegetarian'],
    calories: 440
  },
  {
    id: 'rec-10',
    title: 'Warm Cinnamon Apple Oats Bowl',
    description: 'Creamy rolled oats simmered with milk, honey, cinnamon, and fresh diced apples.',
    prepTimeMinutes: 3,
    cookTimeMinutes: 7,
    servings: 1,
    difficulty: 'Easy',
    category: 'Breakfast',
    cuisine: 'American',
    imageUrl: oatsImg,
    ingredients: [
      { ingredientId: 'ing-37', ingredientName: 'Oats', amount: 1, unit: 'cup' },
      { ingredientId: 'ing-18', ingredientName: 'Milk', amount: 1.5, unit: 'cups' },
      { ingredientId: 'ing-59', ingredientName: 'Cinnamon', amount: 0.5, unit: 'tsp' },
      { ingredientId: 'ing-44', ingredientName: 'Honey', amount: 1, unit: 'tbsp' },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 0.1, unit: 'pinch' }
    ],
    instructions: [
      'Combine oats, milk, cinnamon, and a pinch of salt in a small saucepan over medium heat.',
      'Bring to a gentle simmer, stirring frequently for 5-6 minutes until thick and creamy.',
      'Pour into a serving bowl, drizzle with warm honey, and sprinkle extra cinnamon.'
    ],
    tags: ['Heart Healthy', 'Warm Breakfast', 'High Fiber'],
    dietary: ['Vegetarian', 'Gluten-Free'],
    calories: 320
  },
  {
    id: 'rec-11',
    title: 'Savory Beef Taco Skillet',
    description: 'Seared ground beef seasoned with cumin, garlic, and onions, served with black beans and melted cheese in warm tortillas.',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 3,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Mexican',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-25', ingredientName: 'Ground Beef', amount: 350, unit: 'g' },
      { ingredientId: 'ing-2', ingredientName: 'Onion', amount: 1, unit: 'chopped' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 2, unit: 'cloves' },
      { ingredientId: 'ing-50', ingredientName: 'Cumin', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-51', ingredientName: 'Paprika', amount: 0.5, unit: 'tsp' },
      { ingredientId: 'ing-54', ingredientName: 'Black Beans', amount: 1, unit: 'can (400g)' },
      { ingredientId: 'ing-19', ingredientName: 'Cheddar Cheese', amount: 50, unit: 'g' },
      { ingredientId: 'ing-36', ingredientName: 'Tortillas', amount: 4, unit: 'warm' }
    ],
    instructions: [
      'In a large skillet over medium-high heat, brown ground beef with chopped onion and garlic for 6 minutes.',
      'Drain excess fat if needed. Stir in cumin, paprika, salt, and black beans.',
      'Simmer for 4 minutes until warm throughout.',
      'Sprinkle shredded cheddar cheese over top and cover with lid until melted.',
      'Spoon into warm tortillas and serve.'
    ],
    tags: ['Taco Tuesday', 'One Skillet', 'Family Dinner'],
    dietary: [],
    calories: 580
  },
  {
    id: 'rec-12',
    title: 'Crispy Garlic Roasted Potatoes',
    description: 'Golden cubed potatoes roasted with olive oil, garlic powder, paprika, and oregano until crispy on the outside and fluffy inside.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    difficulty: 'Easy',
    category: 'Snack',
    cuisine: 'Mediterranean',
    imageUrl: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-7', ingredientName: 'Potatoes', amount: 4, unit: 'large, cubed' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-64', ingredientName: 'Garlic Powder', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-51', ingredientName: 'Paprika', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-52', ingredientName: 'Oregano', amount: 0.5, unit: 'tsp' },
      { ingredientId: 'ing-46', ingredientName: 'Salt', amount: 1, unit: 'tsp' }
    ],
    instructions: [
      'Preheat oven to 215°C (425°F). Line a baking sheet with parchment paper.',
      'Toss potato cubes with olive oil, garlic powder, paprika, oregano, and salt in a bowl.',
      'Spread evenly in a single layer on the baking sheet.',
      'Roast for 25 minutes, flipping halfway through, until crispy and golden brown.',
      'Serve hot as a side dish or snack.'
    ],
    tags: ['Vegan', 'Gluten Free', 'Party Snack'],
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
    calories: 260
  },
  {
    id: 'rec-13',
    title: 'Artisan Pepperoni Pizza',
    description: 'Crispy golden pizza crust topped with rich tomato sauce, melted mozzarella, and savory pepperoni slices.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 3,
    difficulty: 'Medium',
    category: 'Dinner',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-35', ingredientName: 'Bread', amount: 1, unit: 'dough base' },
      { ingredientId: 'ing-3', ingredientName: 'Tomatoes', amount: 2, unit: 'pureed' },
      { ingredientId: 'ing-[#Mozzarella]', ingredientName: 'Mozzarella Cheese', amount: 150, unit: 'g' },
      { ingredientId: 'ing-[#Pepperoni]', ingredientName: 'Pepperoni', amount: 80, unit: 'g' },
      { ingredientId: 'ing-[#Oregano]', ingredientName: 'Oregano', amount: 1, unit: 'tsp' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 1, unit: 'tbsp' }
    ],
    instructions: [
      'Preheat oven to 240°C (460°F) with a pizza stone or baking tray inside.',
      'Roll out pizza dough on parchment paper.',
      'Spread tomato sauce evenly, leaving a 1/2-inch border around edges.',
      'Top generously with shredded mozzarella cheese and pepperoni slices.',
      'Bake for 10-12 minutes until crust is golden and cheese is bubbly and brown.',
      'Slice and serve immediately with a sprinkle of oregano.'
    ],
    tags: ['Popular', 'Family Favorite', 'Weekend Cooking'],
    dietary: [],
    calories: 620
  },
  {
    id: 'rec-14',
    title: 'Rich & Creamy Butter Chicken',
    description: 'Tender marinated chicken breast simmered in a velvety, aromatic tomato, butter, and spiced cream sauce.',
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: 'Medium',
    category: 'Dinner',
    cuisine: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-24', ingredientName: 'Chicken Breast', amount: 500, unit: 'g, cubed' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 4, unit: 'cloves' },
      { ingredientId: 'ing-11', ingredientName: 'Ginger', amount: 1, unit: 'tbsp' },
      { ingredientId: 'ing-[#GaramMasala]', ingredientName: 'Garam Masala', amount: 1.5, unit: 'tsp' },
      { ingredientId: 'ing-3', ingredientName: 'Tomatoes', amount: 3, unit: 'blended' },
      { ingredientId: 'ing-22', ingredientName: 'Heavy Cream', amount: 120, unit: 'ml' },
      { ingredientId: 'ing-32', ingredientName: 'White Rice', amount: 2, unit: 'cups' }
    ],
    instructions: [
      'Marinate chicken in yogurt, garlic, ginger, and garam masala for 15 minutes.',
      'Melt 1 tbsp butter in a large pan; sear chicken pieces until golden. Remove and set aside.',
      'Melt remaining butter in the pan, sauté garlic, ginger, and spices until fragrant.',
      'Add tomato puree and simmer for 10 minutes.',
      'Stir in heavy cream and cooked chicken; simmer for 5 minutes until sauce thickens into velvet.',
      'Garnish with cilantro and serve over steaming white rice.'
    ],
    tags: ['Popular', 'Indian Classic', 'Comfort Food'],
    dietary: ['Gluten-Free'],
    calories: 590
  },
  {
    id: 'rec-15',
    title: 'Classic Caesar Salad with Crisp Croutons',
    description: 'Crisp romaine lettuce tossed with creamy Caesar dressing, crunchy garlic croutons, and aged Parmesan shavings.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 2,
    difficulty: 'Easy',
    category: 'Lunch',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-[#Romaine]', ingredientName: 'Romaine Lettuce', amount: 1, unit: 'head, chopped' },
      { ingredientId: 'ing-35', ingredientName: 'Bread', amount: 2, unit: 'slices (croutons)' },
      { ingredientId: 'ing-20', ingredientName: 'Parmesan Cheese', amount: 40, unit: 'g, shaved' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 1, unit: 'clove' },
      { ingredientId: 'ing-[#Mayonnaise]', ingredientName: 'Mayonnaise', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-5', ingredientName: 'Lemon', amount: 0.5, unit: 'juiced' },
      { ingredientId: 'ing-39', ingredientName: 'Olive Oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Cube bread and toss with olive oil and garlic; bake at 200°C for 8 minutes until golden croutons form.',
      'Whisk mayonnaise, lemon juice, minced garlic, and grated parmesan to create Caesar dressing.',
      'Toss chopped romaine lettuce with the dressing until coated.',
      'Top with warm garlic croutons and shaved Parmesan cheese before serving.'
    ],
    tags: ['Popular', 'Fresh & Light', 'Under 15 mins'],
    dietary: ['Vegetarian'],
    calories: 320
  },
  {
    id: 'rec-16',
    title: 'Silky Fettuccine Alfredo Pasta',
    description: 'Fresh fettuccine pasta coated in a rich, buttery garlic Parmesan cream sauce.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    category: 'Dinner',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { ingredientId: 'ing-33', ingredientName: 'Fettuccine', amount: 200, unit: 'g' },
      { ingredientId: 'ing-17', ingredientName: 'Butter', amount: 3, unit: 'tbsp' },
      { ingredientId: 'ing-22', ingredientName: 'Heavy Cream', amount: 150, unit: 'ml' },
      { ingredientId: 'ing-1', ingredientName: 'Garlic', amount: 3, unit: 'cloves, minced' },
      { ingredientId: 'ing-20', ingredientName: 'Parmesan Cheese', amount: 60, unit: 'g, freshly grated' },
      { ingredientId: 'ing-47', ingredientName: 'Black Pepper', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Boil fettuccine pasta in salted water until al dente.',
      'Melt butter in a pan over medium heat. Sauté garlic for 1 minute.',
      'Pour in heavy cream and bring to a simmer for 2 minutes.',
      'Stir in freshly grated Parmesan cheese until melted and creamy.',
      'Toss cooked pasta in Alfredo sauce with 1/4 cup pasta water.',
      'Garnish with black pepper and extra Parmesan.'
    ],
    tags: ['Popular', 'Classic Italian', 'Comfort Food'],
    dietary: ['Vegetarian'],
    calories: 540
  }
];
