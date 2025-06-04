import React from 'react';
import { Paper, Grid, TextField, Box, Switch, FormControlLabel } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { COLORS, getTextColor } from './colorUtils';

const UserPreferences = ({ userPreferences, setUserPreferences, selectedColor, setSelectedColor, darkMode, setDarkMode }) => {
  return (
    <Paper sx={{ 
      p: 2, 
      mb: 3, 
      borderRadius: 2, 
      fontFamily: 'Nunito, sans-serif',
      width: 'fit-content'
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            label="Your Name"
            fullWidth
            value={userPreferences.name}
            onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
            required
            InputProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                  backgroundColor: color.value,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: userPreferences.color === color.value ? '3px solid #000' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              />
            ))}
            <Box
              component="label"
              onClick={(e) => e.stopPropagation()}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: selectedColor,
                borderRadius: '50%',
                cursor: 'pointer',
                border: userPreferences.color === selectedColor ? '3px solid #000' : 'none',
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
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                color="primary"
              />
            }
            label="\u263E"
            sx={{ ml: 2 }}
          />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserPreferences; 