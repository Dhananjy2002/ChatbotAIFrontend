/**
 * Format date to readable time
 */
export const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date to readable date
 */
export const formatDate = (date) => {
  if (!date) return "";
  const now = new Date();
  const messageDate = new Date(date);

  // Today
  if (messageDate.toDateString() === now.toDateString()) {
    return "Today";
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Within this week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (messageDate > weekAgo) {
    return messageDate.toLocaleDateString([], { weekday: "long" });
  }

  // Older
  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
