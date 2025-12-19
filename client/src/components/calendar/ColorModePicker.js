import React from 'react';
import { Box, Fade, IconButton } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { COLORS, getTextColor, createPastelColor, createDarkPastelColor } from './colorUtils';

const ColorModePicker = ({
  color,
  setColor,
  selectedColor,
  setSelectedColor,
  darkMode,
  setDarkMode
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
        {COLORS.map((colorOption) => (
          <Box
            key={colorOption.value}
            onClick={(e) => {
              e.stopPropagation();
              setColor(colorOption.value);
            }}
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              minHeight: 32,
              flexShrink: 0,
              backgroundColor: colorOption.value,
              borderRadius: '50%',
              cursor: 'pointer',
              border: color === colorOption.value ? `3px solid ${darkMode ? '#fff' : '#000'}` : '3px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          />
        ))}
        <Box
          component="label"
          onClick={(e) => {
            e.stopPropagation();
            setColor(selectedColor);
          }}
          sx={{
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            flexShrink: 0,
            backgroundColor: selectedColor,
            borderRadius: '50%',
            cursor: 'pointer',
            border: color === selectedColor ? `3px solid ${darkMode ? '#fff' : '#000'}` : '3px solid transparent',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => {
              e.stopPropagation();
              const newColor = e.target.value;
              setSelectedColor(newColor);
              setColor(newColor);
            }}
            style={{
              opacity: 0,
              position: 'absolute',
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              top: 0,
              left: 0
            }}
          />
          <ColorLensIcon sx={{ color: getTextColor(selectedColor), fontSize: 20 }} />
        </Box>
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          sx={{
            ml: 1,
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: darkMode
              ? '#323232'
              : createPastelColor(color || selectedColor || '#f4f4f4'),
            color: darkMode
              ? '#FFE082'
              : createDarkPastelColor(color || selectedColor || '#4a4a4a'),
            border: `1px solid ${darkMode ? '#4a4a4a' : `${color || selectedColor || '#000000'}55`}`,
            boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.18)',
            transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: darkMode ? '#3a3a3a' : '#ededed',
              boxShadow: darkMode ? '0 6px 14px rgba(0,0,0,0.38)' : '0 6px 14px rgba(0,0,0,0.22)'
            },
            '&:active': {
              backgroundColor: darkMode ? '#353535' : '#e4e4e4'
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <Fade in={!darkMode} timeout={300} unmountOnExit>
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  inset: 0
                }}
              >
                <DarkModeIcon sx={{ fontSize: 24, transition: 'transform 0.4s ease', transform: 'rotate(-15deg)' }} />
              </Box>
            </Fade>
            <Fade in={darkMode} timeout={300} unmountOnExit>
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  inset: 0
                }}
              >
                <LightModeIcon sx={{ fontSize: 24, transition: 'transform 0.4s ease', transform: 'rotate(12deg)' }} />
              </Box>
            </Fade>
          </Box>
        </IconButton>
      </Box>
    </Box>
  );
};

export default ColorModePicker;
