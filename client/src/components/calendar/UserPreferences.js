import React, { useState } from 'react';
import { Paper, Grid, TextField, Box, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ColorModePicker from './ColorModePicker';

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
          <ColorModePicker
            color={userPreferences.color}
            setColor={(color) => setUserPreferences({ ...userPreferences, color })}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserPreferences;
