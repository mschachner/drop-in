// Date utility functions

// Get the next 7 days starting from today
export const getNextSevenDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
};

// Check if a date is a weekend
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Format joiners list into a readable string
export const formatJoiners = (joiners) => {
  if (!joiners || joiners.length === 0) return '';
  if (joiners.length === 1) return `${joiners[0]} will join!`;
  if (joiners.length === 2) return `${joiners[0]} and ${joiners[1]} will join!`;
  return `${joiners.slice(0, -1).join(', ')}, and ${joiners[joiners.length - 1]} will join!`;
}; 