import React from 'react';
import { Box, Typography, Fab, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Event from './Event';
import { createHighlightColor } from './colorUtils';

const CalendarDay = ({
  date,
  dayAvailabilities,
  handleDayClick,
  handleEventClick,
  handleDelete,
  isUserJoining,
  formatJoiners,
  userPreferences
}) => {
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <Box 
      sx={{ 
        p: 2,
        backgroundColor: isWeekend(date) ? '#F5F5F5' : 'white',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        minHeight: 0,
        height: { xs: 'auto', sm: '100%' }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: date.toDateString() === new Date().toDateString() ? createHighlightColor(userPreferences.color) : 'inherit',
              fontFamily: 'Nunito, sans-serif',
              transition: 'color 0.5s ease'
            }}
          >
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: date.toDateString() === new Date().toDateString() ? createHighlightColor(userPreferences.color) : 'inherit',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              transition: 'color 0.5s ease'
            }}
          >
            {date.getDate()}
          </Typography>
        </Box>
        <Fab
          size="small"
          color="primary"
          sx={{
            backgroundColor: userPreferences.color,
            color: getTextColor(userPreferences.color),
            transition: 'all 0.5s ease',
            '&:hover': {
              backgroundColor: userPreferences.color,
              opacity: 0.9
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDayClick(date, 'day');
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Day Section */}
      <Box 
        sx={{ 
          flex: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
        onClick={() => handleDayClick(date, 'day')}
      >
        {dayAvailabilities
          .filter(a => a.section !== 'evening')
          .map((a, idx) => (
            <Event
              key={idx}
              event={a}
              onEventClick={handleEventClick}
              onDelete={handleDelete}
              isUserJoining={isUserJoining}
              formatJoiners={formatJoiners}
            />
          ))}
      </Box>

      {/* Evening Section */}
      <Box sx={{ 
        flex: 1,
        mt: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 1, 
            color: '#666',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600
          }}
        >
          Evening
        </Typography>
        <Box 
          sx={{ 
            flex: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}
          onClick={() => handleDayClick(date, 'evening')}
        >
          {dayAvailabilities
            .filter(a => a.section === 'evening')
            .map((a, idx) => (
              <Event
                key={idx}
                event={a}
                onEventClick={handleEventClick}
                onDelete={handleDelete}
                isUserJoining={isUserJoining}
                formatJoiners={formatJoiners}
              />
            ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarDay; 