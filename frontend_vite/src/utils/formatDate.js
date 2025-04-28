/**
 * Formats a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (date) => {
  if (!date) return "Not available";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    // Format options
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return dateObj.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}; 