/**
 * ФАЙЛ: foodCatalog.js
 * ЧТО ЭТО: Каталог блюд.
 * ЗА ЧТО ОТВЕЧАЕТ: список блюд/категорий для CLIP и промптов.
 */
export const FOOD_CATEGORIES = [
  {
    id: 'salad',
    clipLabel: 'fresh vegetable salad on a plate, not liquid soup',
  },
  {
    id: 'soup',
    clipLabel: 'soup borscht or broth in a bowl with liquid',
  },
  {
    id: 'burger',
    clipLabel: 'burger or hamburger with bun and patty',
  },
  {
    id: 'sandwich_wrap',
    clipLabel: 'sandwich wrap shawarma kebab or hot dog',
  },
  {
    id: 'pizza_pasta',
    clipLabel: 'pizza slice or pasta noodles on a plate',
  },
  {
    id: 'rice',
    clipLabel: 'rice pilaf fried rice or rice bowl with meat',
  },
  {
    id: 'meat',
    clipLabel: 'grilled meat steak chicken cutlet on a plate',
  },
  {
    id: 'breakfast',
    clipLabel: 'breakfast plate with eggs oatmeal or pancakes',
  },
  {
    id: 'dumplings',
    clipLabel: 'dumplings pelmeni manty vareniki on a plate',
  },
  {
    id: 'sides',
    clipLabel: 'french fries potato side dish on a plate',
  },
];

/** @param {object} entry */
function entry(
  id,
  category,
  clipLabels,
  names,
  ingredients,
  weightG,
  calories,
  protein,
  fat,
  carbs
) {
  return {
    id,
    category,
    clipLabels,
    label: clipLabels[0],
    names,
    ingredients,
    weightG,
    calories,
    protein,
    fat,
    carbs,
  };
}

export const FOOD_CATALOG = [
  entry(
    'greek_salad',
    'salad',
    [
      'greek salad with feta cheese tomatoes cucumbers and olives on a plate',
      'horiatiki salad with white cheese cubes and vegetables',
    ],
    { ru: 'Греческий салат', kk: 'Грек салаты', en: 'Greek salad' },
    { ru: ['помидоры', 'огурцы', 'фета', 'оливки', 'лук', 'масло'], en: ['tomatoes', 'cucumbers', 'feta', 'olives', 'onion', 'oil'] },
    280, 320, 12, 24, 14
  ),
  entry(
    'caesar_salad',
    'salad',
    [
      'caesar salad with romaine lettuce croutons and parmesan',
      'chicken caesar salad bowl with creamy dressing',
    ],
    { ru: 'Салат Цезарь', kk: 'Цезарь салаты', en: 'Caesar salad' },
    { ru: ['салат', 'гренки', 'пармезан', 'соус'], en: ['romaine', 'croutons', 'parmesan', 'dressing'] },
    260, 380, 14, 28, 18
  ),
  entry(
    'green_salad',
    'salad',
    [
      'fresh green vegetable salad with lettuce cucumber tomato',
      'mixed vegetable salad without soup broth',
    ],
    { ru: 'Овощной салат', kk: 'Көкөніс салаты', en: 'Vegetable salad' },
    { ru: ['салат', 'огурцы', 'помидоры', 'перец', 'зелень'], en: ['lettuce', 'cucumbers', 'tomatoes', 'peppers', 'herbs'] },
    250, 180, 4, 12, 16
  ),
  entry(
    'olivier_salad',
    'salad',
    [
      'russian olivier salad with potatoes carrots peas and mayonnaise',
      'olivier salad with boiled vegetables and sausage cubes',
    ],
    { ru: 'Салат Оливье', kk: 'Оливье салаты', en: 'Olivier salad' },
    { ru: ['картофель', 'морковь', 'яйцо', 'колбаса', 'горошек', 'майонез'], en: ['potato', 'carrot', 'egg', 'sausage', 'peas', 'mayonnaise'] },
    220, 360, 10, 28, 22
  ),
  entry(
    'cabbage_salad',
    'salad',
    [
      'cabbage salad coleslaw with shredded cabbage and carrots',
      'vinegar cabbage salad on a plate',
    ],
    { ru: 'Салат из капусты', kk: 'Қырыққабат салаты', en: 'Cabbage salad' },
    { ru: ['капуста', 'морковь', 'масло', 'уксус'], en: ['cabbage', 'carrot', 'oil', 'vinegar'] },
    180, 140, 3, 9, 14
  ),
  entry(
    'borscht',
    'soup',
    [
      'red beet borscht soup in a bowl with sour cream',
      'ukrainian borscht with beetroot and cabbage in broth',
    ],
    { ru: 'Борщ', kk: 'Борщ', en: 'Borscht' },
    { ru: ['свёкла', 'капуста', 'картофель', 'морковь', 'говядина', 'сметана'], en: ['beetroot', 'cabbage', 'potato', 'carrot', 'beef', 'sour cream'] },
    400, 290, 16, 14, 28
  ),
  entry(
    'vegetable_soup',
    'soup',
    [
      'clear vegetable soup in a bowl with broth',
      'minestrone style vegetable soup',
    ],
    { ru: 'Овощной суп', kk: 'Көкөніс сорпасы', en: 'Vegetable soup' },
    { ru: ['овощи', 'картофель', 'морковь', 'лук', 'бульон'], en: ['vegetables', 'potato', 'carrot', 'onion', 'broth'] },
    350, 180, 6, 6, 24
  ),
  entry(
    'chicken_soup',
    'soup',
    [
      'chicken noodle soup in a bowl with broth',
      'chicken soup with pieces of chicken and vegetables',
    ],
    { ru: 'Куриный суп', kk: 'Тауық сорпасы', en: 'Chicken soup' },
    { ru: ['куриный бульон', 'курица', 'лапша', 'морковь', 'лук'], en: ['chicken broth', 'chicken', 'noodles', 'carrot', 'onion'] },
    380, 220, 18, 8, 22
  ),
  entry(
    'lagman_soup',
    'soup',
    [
      'lagman noodle soup with beef vegetables and broth in bowl',
      'central asian lagman hand pulled noodles in soup',
    ],
    { ru: 'Лагман', kk: 'Лагман', en: 'Lagman noodle soup' },
    { ru: ['лапша', 'говядина', 'овощи', 'бульон', 'специи'], en: ['noodles', 'beef', 'vegetables', 'broth', 'spices'] },
    420, 480, 22, 18, 52
  ),
  entry(
    'cheeseburger',
    'burger',
    [
      'cheeseburger with beef patty melted cheese and sesame bun',
      'classic cheeseburger on a plate with fries nearby',
    ],
    { ru: 'Чизбургер', kk: 'Чизбургер', en: 'Cheeseburger' },
    { ru: ['булка', 'говяжья котлета', 'сыр', 'салат', 'соус'], en: ['bun', 'beef patty', 'cheese', 'lettuce', 'sauce'] },
    220, 540, 28, 32, 38
  ),
  entry(
    'hamburger',
    'burger',
    [
      'hamburger with beef patty lettuce tomato in bun',
      'plain beef burger without cheese',
    ],
    { ru: 'Гамбургер', kk: 'Гамбургер', en: 'Hamburger' },
    { ru: ['булка', 'котлета', 'салат', 'помидор', 'лук'], en: ['bun', 'patty', 'lettuce', 'tomato', 'onion'] },
    200, 480, 24, 26, 36
  ),
  entry(
    'chicken_burger',
    'burger',
    [
      'crispy chicken burger sandwich with fried chicken fillet in bun',
      'chicken burger with breaded patty',
    ],
    { ru: 'Чикен-бургер', kk: 'Тауық бургері', en: 'Chicken burger' },
    { ru: ['булка', 'куриная котлета', 'салат', 'соус'], en: ['bun', 'chicken fillet', 'lettuce', 'sauce'] },
    210, 490, 26, 22, 40
  ),
  entry(
    'sandwich',
    'sandwich_wrap',
    [
      'deli sandwich with sliced bread ham cheese and vegetables',
      'toast sandwich cut in half on a plate',
    ],
    { ru: 'Сэндвич', kk: 'Сэндвич', en: 'Sandwich' },
    { ru: ['хлеб', 'мясо', 'сыр', 'салат', 'помидор'], en: ['bread', 'meat', 'cheese', 'lettuce', 'tomato'] },
    200, 380, 22, 16, 36
  ),
  entry(
    'club_sandwich',
    'sandwich_wrap',
    [
      'club sandwich triple layer with turkey bacon lettuce',
      'stacked club sandwich with toothpick',
    ],
    { ru: 'Клаб-сэндвич', kk: 'Клаб-сэндвич', en: 'Club sandwich' },
    { ru: ['хлеб', 'индейка', 'бекон', 'салат', 'помидор', 'соус'], en: ['bread', 'turkey', 'bacon', 'lettuce', 'tomato', 'sauce'] },
    240, 450, 26, 22, 38
  ),
  entry(
    'shawarma',
    'sandwich_wrap',
    [
      'shawarma kebab wrap in lavash bread with chicken',
      'doner kebab wrap with meat vegetables sauce',
    ],
    { ru: 'Шаурма', kk: 'Шаурма', en: 'Shawarma' },
    { ru: ['лаваш', 'курица', 'овощи', 'соус'], en: ['flatbread', 'chicken', 'vegetables', 'sauce'] },
    320, 560, 28, 26, 48
  ),
  entry(
    'hot_dog',
    'sandwich_wrap',
    [
      'hot dog sausage in long bun with mustard ketchup',
      'street food hot dog in bread',
    ],
    { ru: 'Хот-дог', kk: 'Хот-дог', en: 'Hot dog' },
    { ru: ['булка', 'сосиска', 'горчица', 'кетчуп'], en: ['bun', 'sausage', 'mustard', 'ketchup'] },
    180, 420, 14, 24, 32
  ),
  entry(
    'pizza',
    'pizza_pasta',
    [
      'pizza slice with melted cheese and toppings',
      'pepperoni pizza on wooden board',
    ],
    { ru: 'Пицца', kk: 'Пицца', en: 'Pizza' },
    { ru: ['тесто', 'сыр', 'томатный соус', 'начинка'], en: ['dough', 'cheese', 'tomato sauce', 'toppings'] },
    280, 620, 24, 28, 68
  ),
  entry(
    'pasta',
    'pizza_pasta',
    [
      'spaghetti pasta with tomato sauce and basil',
      'plate of pasta with red sauce and parmesan',
    ],
    { ru: 'Паста', kk: 'Паста', en: 'Pasta' },
    { ru: ['макароны', 'томатный соус', 'сыр', 'базилик'], en: ['pasta', 'tomato sauce', 'cheese', 'basil'] },
    320, 420, 14, 12, 62
  ),
  entry(
    'lasagna',
    'pizza_pasta',
    [
      'lasagna baked pasta layers with cheese and meat sauce',
      'slice of lasagna on a plate',
    ],
    { ru: 'Лазанья', kk: 'Лазанья', en: 'Lasagna' },
    { ru: ['листы пасты', 'фарш', 'сыр', 'соус бешамель'], en: ['pasta sheets', 'meat sauce', 'cheese', 'bechamel'] },
    300, 520, 26, 28, 42
  ),
  entry(
    'plov',
    'rice',
    [
      'plov pilaf rice with lamb carrots and onions in bowl',
      'uzbek plov with yellow rice and meat pieces',
    ],
    { ru: 'Плов', kk: 'Палау', en: 'Plov pilaf' },
    { ru: ['рис', 'мясо', 'морковь', 'лук', 'специи'], en: ['rice', 'meat', 'carrot', 'onion', 'spices'] },
    350, 520, 24, 22, 58
  ),
  entry(
    'fried_rice',
    'rice',
    [
      'fried rice with vegetables egg and soy sauce in bowl',
      'asian fried rice wok style',
    ],
    { ru: 'Жареный рис', kk: 'Қуырылған күріш', en: 'Fried rice' },
    { ru: ['рис', 'яйцо', 'овощи', 'соевый соус', 'масло'], en: ['rice', 'egg', 'vegetables', 'soy sauce', 'oil'] },
    300, 420, 12, 14, 58
  ),
  entry(
    'chicken_rice',
    'rice',
    [
      'grilled chicken breast with white steamed rice on plate',
      'chicken and rice bowl healthy meal',
    ],
    { ru: 'Куриная грудка с рисом', kk: 'Күрішпен тауық', en: 'Grilled chicken with rice' },
    { ru: ['куриная грудка', 'рис', 'специи', 'масло'], en: ['chicken breast', 'rice', 'spices', 'oil'] },
    350, 485, 42, 12, 48
  ),
  entry(
    'steak',
    'meat',
    [
      'grilled beef steak with grill marks on plate',
      'medium rare steak sliced with vegetables',
    ],
    { ru: 'Стейк', kk: 'Стейк', en: 'Grilled steak' },
    { ru: ['говядина', 'специи', 'масло', 'овощи'], en: ['beef', 'spices', 'butter', 'vegetables'] },
    280, 520, 42, 36, 8
  ),
  entry(
    'grilled_chicken',
    'meat',
    [
      'grilled chicken drumsticks or chicken pieces on plate',
      'roasted chicken legs with golden skin',
    ],
    { ru: 'Курица-гриль', kk: 'Грильдегі тауық', en: 'Grilled chicken' },
    { ru: ['курица', 'специи', 'масло'], en: ['chicken', 'spices', 'oil'] },
    260, 410, 38, 22, 6
  ),
  entry(
    'cutlet_mash',
    'meat',
    [
      'breaded chicken or pork cutlet with mashed potatoes',
      'kotleta cutlet with puree on a plate',
    ],
    { ru: 'Котлета с пюре', kk: 'Пюремен котлета', en: 'Cutlet with mashed potatoes' },
    { ru: ['котлета', 'картофельное пюре', 'масло'], en: ['cutlet', 'mashed potatoes', 'butter'] },
    320, 520, 28, 26, 42
  ),
  entry(
    'fish_grilled',
    'meat',
    [
      'grilled fish fillet on plate with lemon',
      'baked white fish with herbs',
    ],
    { ru: 'Рыба на гриле', kk: 'Грильдегі балық', en: 'Grilled fish' },
    { ru: ['рыба', 'лимон', 'специи', 'масло'], en: ['fish', 'lemon', 'herbs', 'oil'] },
    220, 280, 34, 12, 4
  ),
  entry(
    'pelmeni',
    'dumplings',
    [
      'pelmeni russian dumplings with sour cream on plate',
      'boiled meat dumplings pelmeni in bowl',
    ],
    { ru: 'Пельмени', kk: 'Тұшпара', en: 'Pelmeni dumplings' },
    { ru: ['тесто', 'фарш', 'сметана', 'укроп'], en: ['dough', 'minced meat', 'sour cream', 'dill'] },
    280, 450, 20, 18, 48
  ),
  entry(
    'manty',
    'dumplings',
    [
      'manty steamed dumplings large central asian style',
      'kazakh manty dumplings on plate with onion',
    ],
    { ru: 'Манты', kk: 'Мәнті', en: 'Manty dumplings' },
    { ru: ['тесто', 'фарш', 'лук', 'специи'], en: ['dough', 'meat filling', 'onion', 'spices'] },
    300, 480, 22, 20, 50
  ),
  entry(
    'vareniki',
    'dumplings',
    [
      'vareniki dumplings with potato or cheese filling',
      'ukrainian vareniki boiled dumplings',
    ],
    { ru: 'Вареники', kk: 'Вареники', en: 'Vareniki dumplings' },
    { ru: ['тесто', 'начинка', 'сметана'], en: ['dough', 'filling', 'sour cream'] },
    260, 380, 12, 10, 54
  ),
  entry(
    'oatmeal',
    'breakfast',
    [
      'oatmeal porridge bowl with banana slices and honey',
      'oat porridge breakfast in bowl',
    ],
    { ru: 'Овсянка с бананом', kk: 'Бананмен сұлы ботқасы', en: 'Oatmeal with banana' },
    { ru: ['овсяные хлопья', 'банан', 'молоко', 'мёд'], en: ['oats', 'banana', 'milk', 'honey'] },
    300, 380, 14, 9, 62
  ),
  entry(
    'pancakes',
    'breakfast',
    [
      'stack of pancakes blini with syrup on plate',
      'russian blini thin pancakes',
    ],
    { ru: 'Блины', kk: 'Қыру', en: 'Pancakes' },
    { ru: ['мука', 'яйца', 'молоко', 'сироп'], en: ['flour', 'eggs', 'milk', 'syrup'] },
    250, 450, 10, 14, 68
  ),
  entry(
    'omelette',
    'breakfast',
    [
      'omelette with eggs on plate',
      'scrambled eggs or omelet breakfast',
    ],
    { ru: 'Омлет', kk: 'Омлет', en: 'Omelette' },
    { ru: ['яйца', 'молоко', 'масло', 'соль'], en: ['eggs', 'milk', 'butter', 'salt'] },
    180, 260, 18, 20, 4
  ),
  entry(
    'sushi',
    'rice',
    [
      'sushi rolls and nigiri on a wooden plate',
      'japanese sushi assortment with rice and fish',
    ],
    { ru: 'Суши', kk: 'Суши', en: 'Sushi' },
    { ru: ['рис', 'рыба', 'нори', 'соевый соус'], en: ['rice', 'fish', 'nori', 'soy sauce'] },
    260, 380, 18, 8, 58
  ),
  entry(
    'fries',
    'sides',
    [
      'french fries crispy potato sticks in container',
      'golden french fries on plate',
    ],
    { ru: 'Картофель фри', kk: 'Фри картоп', en: 'French fries' },
    { ru: ['картофель', 'масло', 'соль'], en: ['potato', 'oil', 'salt'] },
    150, 420, 5, 22, 52
  ),
  entry(
    'nuggets',
    'sides',
    [
      'chicken nuggets breaded pieces with sauce',
      'fried chicken nuggets fast food',
    ],
    { ru: 'Наггетсы', kk: 'Наггетс', en: 'Chicken nuggets' },
    { ru: ['курица', 'панировка', 'масло', 'соус'], en: ['chicken', 'breading', 'oil', 'sauce'] },
    180, 420, 22, 24, 28
  ),
];

export function getCatalogLabels() {
  return FOOD_CATALOG.flatMap((item) => item.clipLabels);
}

export function getCatalogByCategoryIds(categoryIds) {
  const allowed = new Set(categoryIds);
  return FOOD_CATALOG.filter((item) => allowed.has(item.category));
}

export function buildFineLabelMap(catalogItems) {
  const labels = [];
  const labelToCatalogId = new Map();

  for (const item of catalogItems) {
    for (const label of item.clipLabels) {
      labels.push(label);
      labelToCatalogId.set(label, item.id);
    }
  }

  return { labels, labelToCatalogId };
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
