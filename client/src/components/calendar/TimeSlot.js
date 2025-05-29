import React from 'react';
import { Box, Typography } from '@mui/material';
import { getTextColor } from './utils/colorUtils';

const TimeSlot = ({ time, color, isHovered }) => {
  return (
    <Box
      sx={{
        backgroundColor: color,
        color: getTextColor(color),
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateX(-8px)' : 'none',
        display: 'inline-block',
        marginRight: '8px'
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        }}
      >
        {time}
      </Typography>
    </Box>
  );
};

export default TimeSlot; 