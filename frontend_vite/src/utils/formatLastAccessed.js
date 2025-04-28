export const formatLastAccessed = (lastAccessed) => {
    if (!lastAccessed) return 'Never';
    
    const date = new Date(lastAccessed);
    const now = new Date();
    
    // Reset hours, minutes, seconds for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const accessDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // If it's today, show only time
    if (accessDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    // Calculate days difference
    const diffInDays = Math.floor((today - accessDate) / (1000 * 60 * 60 * 24));
    
    // If within 7 days, show "X days ago"
    if (diffInDays < 7) {
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays} days ago`;
    }
    
    // For older dates, show the date in "DD MMM YYYY" format
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};