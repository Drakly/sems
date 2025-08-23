/**
 * Utility functions for handling expense categories
 */

/**
 * Converts backend category enum format to display format
 * Example: "OFFICE_SUPPLIES" -> "Office Supplies"
 * @param category - The category string from backend (enum format)
 * @returns Formatted category name for display
 */
export const formatCategoryForDisplay = (category: string | undefined | null): string => {
  if (!category || typeof category !== 'string') {
    return 'Other';
  }
  
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets all available expense categories (matching backend enum)
 */
export const getExpenseCategories = () => [
  'TRAVEL',
  'ACCOMMODATION', 
  'MEALS',
  'ENTERTAINMENT',
  'OFFICE_SUPPLIES',
  'SOFTWARE',
  'HARDWARE',
  'TELECOMMUNICATION',
  'TRAINING',
  'MARKETING',
  'CONSULTING',
  'LEGAL',
  'INSURANCE',
  'TAXES',
  'UTILITIES',
  'MISCELLANEOUS'
];

/**
 * Gets formatted category options for dropdowns
 */
export const getCategoryOptions = () => 
  getExpenseCategories().map(category => ({
    value: category,
    label: formatCategoryForDisplay(category)
  }));
