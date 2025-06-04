// Color constants
// Slightly lighter presets so they look good on a dark background as well
export const COLORS = [
  { value: '#66BB6A', label: 'Green' },
  { value: '#64B5F6', label: 'Blue' },
  { value: '#FFB74D', label: 'Orange' },
  { value: '#BA68C8', label: 'Purple' },
  { value: '#EF5350', label: 'Red' },
  { value: '#FF99C8', label: 'Pink' },
  { value: '#A1887F', label: 'Brown' }
];

// Function to convert hex to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Function to calculate relative luminance of a color
export const calculateLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  // Convert RGB to relative luminance
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Function to determine if text should be black or white based on background color
export const getTextColor = (backgroundColor) => {
  const luminance = calculateLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Function to create a very light pastel version of a color
export const createPastelColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Mix with white to create a very light pastel (80% white, 20% color)
  const pastelR = Math.round((rgb.r * 0.2) + (255 * 0.8));
  const pastelG = Math.round((rgb.g * 0.2) + (255 * 0.8));
  const pastelB = Math.round((rgb.b * 0.2) + (255 * 0.8));

  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
};

// Function to create a dark pastel version of a color (60% black, 40% color)
export const createDarkPastelColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const pastelR = Math.round(rgb.r * 0.4);
  const pastelG = Math.round(rgb.g * 0.4);
  const pastelB = Math.round(rgb.b * 0.4);

  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
};

// Function to create a darker version of a color
export const darkenColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Darken by 30%
  const darkenR = Math.round(rgb.r * 0.7);
  const darkenG = Math.round(rgb.g * 0.7);
  const darkenB = Math.round(rgb.b * 0.7);
  
  return `rgb(${darkenR}, ${darkenG}, ${darkenB})`;
};

// Function to create a subtle highlight color that maintains readability
export const createHighlightColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Mix with black to create a darker version (30% black, 70% color)
  const highlightR = Math.round(rgb.r * 0.7);
  const highlightG = Math.round(rgb.g * 0.7);
  const highlightB = Math.round(rgb.b * 0.7);
  
  return `rgb(${highlightR}, ${highlightG}, ${highlightB})`;
};

// Function to check if a date is a weekend (Saturday or Sunday)
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}; 