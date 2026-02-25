export const DEFAULT_COLOR = '#66BB6A';

export const SECTIONS = {
  DAY: 'day',
  EVENING: 'evening',
};

export const LOCAL_STORAGE_KEYS = {
  CALENDAR_ID: 'calendarId',
  USER_NAME: 'userName',
  preferredColor: (calendarId) => `calendar.${calendarId}.preferredColor`,
  darkMode: (calendarId) => `calendar.${calendarId}.darkMode`,
};
