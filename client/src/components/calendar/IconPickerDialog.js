import React, { useState } from 'react';
import {
  Popover,
  Tabs,
  Tab,
  Box,
  IconButton
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { createPastelColor, createDarkPastelColor, getTextColor } from './colorUtils';

const emojiList = [
  '📅', '⏰', '🎉', '🎂', '🎁', '🎈', '🔥','🪅', '🎊',
  '🎵', '🎧', '🎤', '🎻', '🎬', '📽️',
  '🍿', '🎮', '🧩', '♟️', '🃏', '🧠', '💡', '📚', '✏️', '📝',
  '🏃', '🏋️', '🧘', '🚴', '🏕️', '🎣', '🎿', '🏖️',
  '🍽️', '🍕', '🍔', '☕', '🍺', '🍷',
  '💻', '🖋️', '📊', '📎', '🛠️', '📞',
  '🚗', '✈️', '🚌', '🏥', '🏫', '🏛️', '⛪', '🛒', '🧳', '🏠',
];

const IconPickerDialog = ({ anchorEl, onClose, onSelect, userColor, darkMode }) => {
  const [tab, setTab] = useState(0);
  const iconNames = [
  'Event', 'Schedule', 'Celebration', 'Cake', 'MusicNote', 'Headphones', 'Mic', 'Movie',
  'Theaters', 'Videocam', 'Games', 'Extension', 'SportsEsports', 'Psychology',
  'Lightbulb', 'MenuBook', 'EditNote', 'School', 'Science','Functions',
  'FitnessCenter', 'DirectionsRun', 'SelfImprovement', 'DirectionsBike', 'Cabin',
  'Kitesurfing', 'Hiking', 'BeachAccess', 'Map', 'Restaurant', 'LocalPizza',
  'Fastfood', 'RamenDining', 'Coffee', 'WineBar', 'LocalBar', 'BakeryDining',
  'Laptop', 'Draw', 'InsertChart', 'TrendingUp', 'AttachFile',
  'Work', 'Build', 'Construction', 'Phone', 'DirectionsCar', 'Flight', 'DirectionsBus',
  'LocalHospital', 'AccountBalance', 'Church', 'ShoppingCart', 'Luggage', 'Home'
  ];

  const open = Boolean(anchorEl);
  const bgColor = darkMode ? createDarkPastelColor(userColor) : createPastelColor(userColor);
  const textColor = darkMode ? getTextColor(bgColor) : '#333';

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          backgroundColor: bgColor,
          color: textColor,
          p: 2,
          fontFamily: 'Nunito, sans-serif',
          maxWidth: 320,
          borderRadius: 6,
        }
      }}
    >
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        centered
        textColor="inherit"
        TabIndicatorProps={{ sx: { backgroundColor: textColor } }}
      >
        <Tab label="icons" sx={{ textTransform: 'lowercase', fontFamily: 'Nunito, sans-serif', color: textColor }} />
        <Tab label="emoji" sx={{ textTransform: 'lowercase', fontFamily: 'Nunito, sans-serif', color: textColor }} />
      </Tabs>
      <Box sx={{ mt: 1 }}>
        {tab === 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
            {iconNames.map((name) => {
              const IconComp = Icons[name];
              return (
                <IconButton
                  key={name}
                  onClick={() => {
                    onSelect(name);
                    onClose();
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: darkMode ? '#757575' : '#ccc',
                    color: darkMode ? '#fff' : '#333',
                  }}
                >
                  <IconComp />
                </IconButton>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
            {emojiList.map((emo) => (
              <IconButton
                key={emo}
                onClick={() => {
                  onSelect(emo);
                  onClose();
                }}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#757575' : '#ccc',
                  color: darkMode ? '#fff' : '#333',
                }}
              >
                <span style={{ fontSize: '24px' }}>{emo}</span>
              </IconButton>
            ))}
          </Box>
        )}
      </Box>
    </Popover>
  );
};

export default IconPickerDialog;
