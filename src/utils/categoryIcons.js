/**
 * Category icon + color heuristics.
 *
 * These helpers map free-form category names to a representative icon and color.
 * The logic intentionally uses substring checks (rather than exact equality) to
 * tolerate user-created variations (e.g. "Fresh Fruits", "Citrus fruit box").
 *
 * Edge cases:
 *  - Overlapping terms ("fish" vs "seafood"): seafood path wins due to explicit branch.
 *  - Unrecognized categories fall back to a generic package icon and a neutral color.
 *  - Performance: O(n) string includes checks; acceptable given very small word set.
 */
import {
  Apple,
  Carrot,
  Milk,
  Wheat,
  Beef,
  Fish,
  Coffee,
  Cookie,
  Snowflake,
  Package,
  Banana,
  Lettuce,
  Cheese,
  Bread,
  Ham,
  Shell,
  Wine,
  Candy,
  Refrigerator,
  Archive
} from 'lucide-react-native';
import { Colors } from '../constants/colors';

/**
 * Infer an icon component for a given category name.
 * @param {string} categoryName
 * @returns {React.ComponentType} Lucide icon component
 */
export const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || 
      name.includes('orange') || name.includes('grape') || name.includes('berry')) {
    return Apple;
  }
  
  if (name.includes('vegetable') || name.includes('carrot') || name.includes('lettuce') || 
      name.includes('tomato') || name.includes('potato') || name.includes('onion')) {
    return Carrot;
  }
  
  if (name.includes('dairy') || name.includes('milk') || name.includes('cheese') || 
      name.includes('yogurt') || name.includes('butter') || name.includes('cream')) {
    return Milk;
  }
  
  if (name.includes('grain') || name.includes('bread') || name.includes('wheat') || 
      name.includes('rice') || name.includes('pasta') || name.includes('cereal')) {
    return Wheat;
  }
  
  if (name.includes('meat') || name.includes('beef') || name.includes('chicken') || 
      name.includes('pork') || name.includes('ham') || name.includes('sausage')) {
    return Beef;
  }
  
  if (name.includes('seafood') || name.includes('fish') || name.includes('salmon') || 
      name.includes('tuna') || name.includes('shrimp') || name.includes('crab')) {
    return Fish;
  }
  
  if (name.includes('beverage') || name.includes('drink') || name.includes('coffee') || 
      name.includes('tea') || name.includes('juice') || name.includes('soda')) {
    return Coffee;
  }
  
  if (name.includes('snack') || name.includes('cookie') || name.includes('chip') || 
      name.includes('candy') || name.includes('chocolate') || name.includes('biscuit')) {
    return Cookie;
  }
  
  if (name.includes('frozen') || name.includes('ice') || name.includes('freeze')) {
    return Snowflake;
  }
  
  if (name.includes('canned') || name.includes('packaged') || name.includes('jar') || 
      name.includes('bottle') || name.includes('can')) {
    return Package;
  }
  
  return Package;
};

/**
 * Infer a theme color for a given category name.
 * @param {string} categoryName
 * @returns {string} hex color (design token)
 */
export const getCategoryColor = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('fruit')) return Colors.categories.fruits;
  if (name.includes('vegetable')) return Colors.categories.vegetables;
  if (name.includes('dairy')) return Colors.categories.dairy;
  if (name.includes('grain') || name.includes('bread')) return Colors.categories.grains;
  if (name.includes('meat')) return Colors.categories.meat;
  if (name.includes('seafood') || name.includes('fish')) return Colors.categories.seafood;
  if (name.includes('beverage') || name.includes('drink')) return Colors.categories.beverages;
  if (name.includes('snack')) return Colors.categories.snacks;
  if (name.includes('frozen')) return Colors.categories.frozen;
  if (name.includes('canned')) return Colors.categories.canned;
  
  return Colors.gray[100];
};
