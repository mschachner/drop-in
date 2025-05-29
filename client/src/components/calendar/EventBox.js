import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTextColor } from './utils/colorUtils';
import { formatJoiners } from './utils/dateUtils';

const EventBox = ({ 
  event, 
  onEventClick, 
  onDelete, 
  isUserJoining 
}) => {
  return (
    <Paper
      sx={{
        p: 1.5,
        mb: 1.5,
        backgroundColor: event.color,
        color: getTextColor(event.color),
        borderRadius: 2,
        position: 'relative',
        fontFamily: 'Nunito, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          '& .event-actions': {
            opacity: 1
          }
        }
      }}
      onClick={(e) => onEventClick(event, e)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5,
            position: 'relative'
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                fontFamily: 'Nunito, sans-serif',
                wordBreak: 'break-word',
                lineHeight: 1.2,
                flex: 1,
                pr: 1
              }}
            >
              {event.name}
            </Typography>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.2s ease',
              transform: 'translateX(0)',
              '.event-actions': {
                opacity: 0,
                transform: 'translateX(20px)',
                transition: 'all 0.2s ease'
              },
              '&:hover': {
                '.event-actions': {
                  opacity: 1,
                  transform: 'translateX(0)'
                }
              }
            }}>
              <Tooltip title={event.timeSlot} arrow placement="top">
                <Box sx={{ 
                  minWidth: '60px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: '0 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-60px)'
                  }
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    fontFamily: 'Nunito, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {event.timeSlot}
                  </Typography>
                </Box>
              </Tooltip>
              <Box 
                className="event-actions"
                sx={{ 
                  display: 'flex',
                  gap: 0.5,
                  backgroundColor: 'transparent',
                  padding: '0 4px',
                  borderRadius: '12px',
                  zIndex: 1
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event, e);
                  }}
                  sx={{
                    color: getTextColor(event.color),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    },
                    minWidth: isUserJoining(event) ? '50px' : 'auto',
                    justifyContent: 'flex-start',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isUserJoining(event) ? (
                    <>
                      <span>Joined</span>
                      <span style={{ fontSize: '1em' }}>✓</span>
                    </>
                  ) : (
                    'Join'
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: getTextColor(event.color),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    },
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              opacity: 0.9,
              wordBreak: 'break-word',
              lineHeight: 1.2
            }}
          >
            {event.location}
          </Typography>
          {event.joiners && event.joiners.length > 0 && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Nunito, sans-serif',
                mt: 1,
                fontSize: '0.75rem',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {formatJoiners(event.joiners)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default EventBox; 