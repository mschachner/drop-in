import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { getTextColor } from './utils/colorUtils';

const EventActions = ({ 
  event, 
  onDelete, 
  onJoin, 
  isUserJoining, 
  userPreferences,
  isHovered 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)'
      }}
    >
      {!isUserJoining && (
        <Tooltip title="Join Event">
          <IconButton
            onClick={onJoin}
            size="small"
            sx={{
              backgroundColor: userPreferences.color,
              color: getTextColor(userPreferences.color),
              '&:hover': {
                backgroundColor: userPreferences.color,
                opacity: 0.9
              }
            }}
          >
            <PersonAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Delete Event">
        <IconButton
          onClick={onDelete}
          size="small"
          sx={{
            backgroundColor: '#ff4444',
            color: 'white',
            '&:hover': {
              backgroundColor: '#ff4444',
              opacity: 0.9
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EventActions; 