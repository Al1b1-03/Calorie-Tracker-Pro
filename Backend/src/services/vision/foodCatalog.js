/**
 * Food catalog for local zero-shot CLIP classification.
 */
export const FOOD_CATALOG = [
  {
    id: 'greek_salad',
    label: 'greek salad with feta cheese tomatoes cucumbers and olives on a plate',
    names: { ru: 'Греческий салат', kk: 'Грек салаты', en: 'Greek salad' },
    ingredients: { ru: ['помидоры', 'огурцы', 'фета', 'оливки', 'лук', 'оливковое масло'], en: ['tomatoes', 'cucumbers', 'feta', 'olives', 'onion', 'olive oil'] },
    weightG: 280, calories: 320, protein: 12, fat: 24, carbs: 14,
  },
  {
    id: 'caesar_salad',
    label: 'caesar salad with lettuce croutons parmesan and dressing',
    names: { ru: 'Салат Цезарь', kk: 'Цезарь салаты', en: 'Caesar salad' },
    ingredients: { ru: ['салат', 'гренки', 'пармезан', 'соус цезарь'], en: ['romaine lettuce', 'croutons', 'parmesan', 'caesar dressing'] },
    weightG: 260, calories: 380, protein: 14, fat: 28, carbs: 18,
  },
  {
    id: 'green_salad',
    label: 'fresh green vegetable salad with mixed lettuce and vegetables',
    names: { ru: 'Овощной салат', kk: 'Көкөніс салаты', en: 'Vegetable salad' },
    ingredients: { ru: ['салат', 'огурцы', 'помидоры', 'перец', 'зелень'], en: ['lettuce', 'cucumbers', 'tomatoes', 'peppers', 'herbs'] },
    weightG: 250, calories: 180, protein: 4, fat: 12, carbs: 16,
  },
  {
    id: 'cheeseburger',
    label: 'cheeseburger with beef patty cheese and bun on a plate',
    names: { ru: 'Чизбургер', kk: 'Чизбургер', en: 'Cheeseburger' },
    ingredients: { ru: ['булка', 'говяжья котлета', 'сыр', 'салат', 'соус'], en: ['bun', 'beef patty', 'cheese', 'lettuce', 'sauce'] },
    weightG: 220, calories: 540, protein: 28, fat: 32, carbs: 38,
  },
  {
    id: 'hamburger',
    label: 'hamburger with beef patty and bun',
    names: { ru: 'Гамбургер', kk: 'Гамбургер', en: 'Hamburger' },
    ingredients: { ru: ['булка', 'котлета', 'салат', 'помидор', 'лук'], en: ['bun', 'patty', 'lettuce', 'tomato', 'onion'] },
    weightG: 200, calories: 480, protein: 24, fat: 26, carbs: 36,
  },
  {
    id: 'chicken_burger',
    label: 'chicken burger sandwich with fried chicken fillet',
    names: { ru: 'Чикен-бургер', kk: 'Тауық бургері', en: 'Chicken burger' },
    ingredients: { ru: ['булка', 'куриная котлета', 'салат', 'соус'], en: ['bun', 'chicken fillet', 'lettuce', 'sauce'] },
    weightG: 210, calories: 490, protein: 26, fat: 22, carbs: 40,
  },
  {
    id: 'borscht',
    label: 'red beet borscht soup in a bowl with sour cream',
    names: { ru: 'Борщ', kk: 'Бorsch', en: 'Borscht' },
    ingredients: { ru: ['свёкла', 'капуста', 'картофель', 'морковь', 'говядина', 'сметана'], en: ['beetroot', 'cabbage', 'potato', 'carrot', 'beef', 'sour cream'] },
    weightG: 400, calories: 290, protein: 16, fat: 14, carbs: 28,
  },
  {
    id: 'vegetable_soup',
    label: 'vegetable soup in a bowl',
    names: { ru: 'Овощной суп', kk: 'Көкөніс сорпасы', en: 'Vegetable soup' },
    ingredients: { ru: ['овощи', 'картофель', 'морковь', 'лук', 'зелень'], en: ['vegetables', 'potato', 'carrot', 'onion', 'herbs'] },
    weightG: 350, calories: 180, protein: 6, fat: 6, carbs: 24,
  },
  {
    id: 'chicken_soup',
    label: 'chicken noodle soup in a bowl',
    names: { ru: 'Куриный суп', kk: 'Тауық сорпасы', en: 'Chicken soup' },
    ingredients: { ru: ['куриный бульон', 'курица', 'лапша', 'морковь', 'лук'], en: ['chicken broth', 'chicken', 'noodles', 'carrot', 'onion'] },
    weightG: 380, calories: 220, protein: 18, fat: 8, carbs: 22,
  },
  {
    id: 'sandwich',
    label: 'deli sandwich with bread meat and vegetables',
    names: { ru: 'Сэндвич', kk: 'Сэндвич', en: 'Sandwich' },
    ingredients: { ru: ['хлеб', 'мясо', 'сыр', 'салат', 'помидор'], en: ['bread', 'meat', 'cheese', 'lettuce', 'tomato'] },
    weightG: 200, calories: 380, protein: 22, fat: 16, carbs: 36,
  },
  {
    id: 'club_sandwich',
    label: 'club sandwich with triple layer bread turkey bacon and lettuce',
    names: { ru: 'Клаб-сэндвич', kk: 'Клаб-сэндвич', en: 'Club sandwich' },
    ingredients: { ru: ['хлеб', 'индейка', 'бекон', 'салат', 'помидор', 'соус'], en: ['bread', 'turkey', 'bacon', 'lettuce', 'tomato', 'sauce'] },
    weightG: 240, calories: 450, protein: 26, fat: 22, carbs: 38,
  },
  {
    id: 'pizza',
    label: 'pizza slice with cheese and toppings',
    names: { ru: 'Пицца', kk: 'Пizza', en: 'Pizza' },
    ingredients: { ru: ['тесто', 'сыр', 'томатный соус', 'начинка'], en: ['dough', 'cheese', 'tomato sauce', 'toppings'] },
    weightG: 280, calories: 620, protein: 24, fat: 28, carbs: 68,
  },
  {
    id: 'pasta',
    label: 'plate of pasta with tomato sauce',
    names: { ru: 'Паста', kk: 'Паста', en: 'Pasta' },
    ingredients: { ru: ['макароны', 'томатный соус', 'сыр', 'базилик'], en: ['pasta', 'tomato sauce', 'cheese', 'basil'] },
    weightG: 320, calories: 420, protein: 14, fat: 12, carbs: 62,
  },
  {
    id: 'chicken_rice',
    label: 'grilled chicken breast with white rice on a plate',
    names: { ru: 'Куриная грудка с рисом', kk: 'Куриная грудка с рисом', en: 'Grilled chicken with rice' },
    ingredients: { ru: ['куриная грудка', 'рис', 'специи', 'масло'], en: ['chicken breast', 'rice', 'spices', 'oil'] },
    weightG: 350, calories: 485, protein: 42, fat: 12, carbs: 48,
  },
  {
    id: 'fried_rice',
    label: 'fried rice with vegetables and egg in a bowl',
    names: { ru: 'Жареный рис', kk: 'Қуырылған күріш', en: 'Fried rice' },
    ingredients: { ru: ['рис', 'яйцо', 'овощи', 'соевый соус', 'масло'], en: ['rice', 'egg', 'vegetables', 'soy sauce', 'oil'] },
    weightG: 300, calories: 420, protein: 12, fat: 14, carbs: 58,
  },
  {
    id: 'oatmeal',
    label: 'oatmeal porridge bowl with banana and honey',
    names: { ru: 'Овсянка с бананом', kk: 'Бананмен сұлы ботқасы', en: 'Oatmeal with banana' },
    ingredients: { ru: ['овсяные хлопья', 'банан', 'молоко', 'мёд'], en: ['oats', 'banana', 'milk', 'honey'] },
    weightG: 300, calories: 380, protein: 14, fat: 9, carbs: 62,
  },
  {
    id: 'pancakes',
    label: 'stack of pancakes with syrup on a plate',
    names: { ru: 'Блины', kk: 'Қыру', en: 'Pancakes' },
    ingredients: { ru: ['мука', 'яйца', 'молоко', 'сироп'], en: ['flour', 'eggs', 'milk', 'syrup'] },
    weightG: 250, calories: 450, protein: 10, fat: 14, carbs: 68,
  },
  {
    id: 'sushi',
    label: 'sushi rolls and nigiri on a plate',
    names: { ru: 'Суши', kk: 'Сushi', en: 'Sushi' },
    ingredients: { ru: ['рис', 'рыба', 'нori', 'соевый соус'], en: ['rice', 'fish', 'nori', 'soy sauce'] },
    weightG: 260, calories: 380, protein: 18, fat: 8, carbs: 58,
  },
  {
    id: 'shawarma',
    label: 'shawarma kebab wrap in lavash bread',
    names: { ru: 'Шаурма', kk: 'Shaurma', en: 'Shawarma' },
    ingredients: { ru: ['лаваш', 'курица', 'овощи', 'соус'], en: ['flatbread', 'chicken', 'vegetables', 'sauce'] },
    weightG: 320, calories: 560, protein: 28, fat: 26, carbs: 48,
  },
  {
    id: 'steak',
    label: 'grilled beef steak on a plate with vegetables',
    names: { ru: 'Стейк', kk: 'Стейк', en: 'Grilled steak' },
    ingredients: { ru: ['говядина', 'специи', 'масло', 'овощи'], en: ['beef', 'spices', 'butter', 'vegetables'] },
    weightG: 280, calories: 520, protein: 42, fat: 36, carbs: 8,
  },
  {
    id: 'fries',
    label: 'french fries in a container or on a plate',
    names: { ru: 'Картофель фри', kk: 'Фри картоп', en: 'French fries' },
    ingredients: { ru: ['картофель', 'масло', 'соль'], en: ['potato', 'oil', 'salt'] },
    weightG: 150, calories: 420, protein: 5, fat: 22, carbs: 52,
  },
  {
    id: 'plov',
    label: 'plov pilaf rice with meat and carrots in a bowl',
    names: { ru: 'Плов', kk: 'Палау', en: 'Plov pilaf' },
    ingredients: { ru: ['рис', 'мясо', 'морковь', 'лук', 'специи'], en: ['rice', 'meat', 'carrot', 'onion', 'spices'] },
    weightG: 350, calories: 520, protein: 24, fat: 22, carbs: 58,
  },
];

export function getCatalogLabels() {
  return FOOD_CATALOG.map((item) => item.label);
}

export function resolveCatalogEntry(catalogId, lang = 'ru') {
  const entry = FOOD_CATALOG.find((item) => item.id === catalogId);
  if (!entry) return null;

  const langKey = lang === 'kk' ? 'kk' : lang === 'en' ? 'en' : 'ru';

  return {
    dishName: entry.names[langKey] || entry.names.ru || entry.names.en,
    ingredients: entry.ingredients[langKey] || entry.ingredients.ru || entry.ingredients.en || [],
    estimatedWeightG: entry.weightG,
    calories: entry.calories,
    protein: entry.protein,
    fat: entry.fat,
    carbs: entry.carbs,
    catalogId: entry.id,
  };
}
