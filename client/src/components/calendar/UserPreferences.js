import React, { useState } from 'react';
import { Paper, Grid, TextField, Box, IconButton, Typography, Fade } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EditIcon from '@mui/icons-material/Edit';
import { COLORS, getTextColor } from './colorUtils';

const UserPreferences = ({ userPreferences, setUserPreferences, selectedColor, setSelectedColor, darkMode, setDarkMode }) => {
  const [isEditingName, setIsEditingName] = useState(!userPreferences.name);

  const handleNameBlur = () => {
    if (userPreferences.name.trim()) {
      setIsEditingName(false);
    }
  };

  return (
    <Paper sx={{
      p: 2,
      mb: 3,
      borderRadius: 2,
      fontFamily: 'Nunito, sans-serif',
      width: '100%',
      maxWidth: 'min(750px, calc(100% - 64px))',
      backgroundColor: darkMode ? '#424242' : 'white',
      color: darkMode ? '#fff' : 'inherit'
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          {isEditingName ? (
            <TextField
              label="Your Name"
              fullWidth
              value={userPreferences.name}
              onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
              onBlur={handleNameBlur}
              autoFocus
              required
              InputProps={{
                sx: {
                  fontFamily: 'Nunito, sans-serif',
                  backgroundColor: darkMode ? '#616161' : 'white',
                  color: darkMode ? '#fff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? '#bbb' : 'inherit'
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: 'Nunito, sans-serif',
                  color: darkMode ? '#fff' : 'inherit'
                }
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Nunito, sans-serif',
                color: darkMode ? '#fff' : 'inherit',
                width: '100%'
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }}
              >
                {userPreferences.name}
              </Typography>
              <IconButton
                aria-label="edit name"
                onClick={() => setIsEditingName(true)}
                size="small"
                sx={{ ml: 1, color: darkMode ? '#fff' : 'inherit' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              {COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserPreferences({ ...userPreferences, color: color.value });
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    flexShrink: 0,
                    backgroundColor: color.value, 
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: userPreferences.color === color.value ? `3px solid ${darkMode ? '#fff' : '#000'}` : 'none',
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
                  setUserPreferences({ ...userPreferences, color: selectedColor });
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
                  border: userPreferences.color === selectedColor ? `3px solid ${darkMode ? '#fff' : '#000'}` : 'none',
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
                    setUserPreferences({ ...userPreferences, color: newColor });
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
              <Box
                component="button"
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  ml: 1,
                  flexShrink: 0,
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minWidth: 150,
                  background: darkMode
                    ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.2)), linear-gradient(135deg, ${userPreferences.color}33, ${userPreferences.color}66)`
                    : `linear-gradient(135deg, ${userPreferences.color}80, ${userPreferences.color})`,
                  color: darkMode ? '#FFF8E1' : getTextColor(userPreferences.color),
                  boxShadow: darkMode
                    ? '0 12px 30px rgba(0,0,0,0.45)'
                    : '0 12px 30px rgba(0,0,0,0.18)',
                  transition: 'background 0.5s ease, box-shadow 0.5s ease, transform 0.2s ease, color 0.5s ease',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.15), transparent 55%)',
                    opacity: darkMode ? 0.35 : 0.55,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none'
                  },
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.02)',
                    boxShadow: darkMode
                      ? '0 18px 40px rgba(0,0,0,0.5)'
                      : '0 18px 40px rgba(0,0,0,0.22)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${darkMode ? '#FFF8E1' : userPreferences.color}`,
                    outlineOffset: 3
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 32,
                    width: '100%'
                  }}
                >
                  <Fade in={!darkMode} timeout={400} unmountOnExit>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textTransform: 'none'
                      }}
                    >
                      <DarkModeIcon sx={{ fontSize: 26, transition: 'transform 0.4s ease', transform: 'rotate(-10deg)' }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Dark Mode</Typography>
                    </Box>
                  </Fade>
                  <Fade in={darkMode} timeout={400} unmountOnExit>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textTransform: 'none'
                      }}
                    >
                      <LightModeIcon sx={{ fontSize: 26, transition: 'transform 0.4s ease', transform: 'rotate(15deg)' }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Light Mode</Typography>
                    </Box>
                  </Fade>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserPreferences;
