import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Box,
  Typography,
  Fab,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as Icons from '@mui/icons-material';
import { createHighlightColor, getTextColor, isWeekend } from './colorUtils';
import useElementWidth from '../../hooks/useElementWidth';
import useChildrenWidth from '../../hooks/useChildrenWidth';

const ColumnEvent = ({
  availability,
  timeBoxWidth,
  actionsMaxWidth,
  handleJoin,
  handleEdit,
  handleDelete,
  handleEventClick,
  isUserJoining,
  formatJoiners,
  isMobile,
  activeEventId,
  darkMode
}) => {
  const actionsRef = useRef(null);
  const actionsWidth = useChildrenWidth(actionsRef);
  const shouldWrapActions = actionsWidth > actionsMaxWidth;
  const effectiveTimeBoxWidth = actionsWidth > 0
    ? Math.min(timeBoxWidth, actionsWidth)
    : timeBoxWidth;

  const a = availability;

  return (
    <Paper
      key={a._id}
      sx={{
        p: 1.5,
        mb: 1.5,
        backgroundColor: a.color,
        color: getTextColor(a.color),
        borderRadius: 2,
        position: 'relative',
        fontFamily: 'Nunito, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        willChange: 'transform, box-shadow',
        '&:hover .time-box': {
          backgroundColor: a.color,
          '&::before': {
            opacity: 0
          }
        },
        '&:hover .event-actions': {
          opacity: { xs: 1, sm: 1 }
        }
      }}
      className="event-paper"
      onClick={(e) => handleEventClick(a, e)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, position: 'relative', minHeight: '40px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {a.icon && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {Icons[a.icon] ? (
                    React.createElement(Icons[a.icon], { fontSize: 'small' })
                  ) : (
                    <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                  )}
                </Box>
              )}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  flex: 1,
                  pr: 1,
                  position: 'relative',
                  zIndex: 3
                }}
              >
                {a.name}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${effectiveTimeBoxWidth}px`,
                  height: { xs: '36px', sm: '28px' },
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.235)',
                  backdropFilter: 'blur(4px)',
                  color: getTextColor(a.color),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: '0 8px',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  fontFamily: 'Nunito, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: `${actionsMaxWidth}px`,
                  zIndex: 2,
                  pointerEvents: 'none',
                  right: isMobile ? (isUserJoining(a) ? '180px' : '142px') : 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '-2px',
                    backgroundColor: a.color,
                    borderRadius: 'inherit',
                    opacity: 0.6,
                    zIndex: -1
                  }
                }}
                className="time-box"
              >
                {a.timeSlot}
              </Box>
              <Box
                className="event-actions"
                ref={actionsRef}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: shouldWrapActions ? 'wrap' : 'nowrap',
                  maxWidth: `${actionsMaxWidth}px`,
                  opacity: isMobile ? 1 : (activeEventId === a._id ? 1 : 0),
                  transition: { xs: 'none', sm: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1)' },
                  zIndex: 1,
                  '&.event-paper:hover .event-actions': {
                    opacity: { xs: 1, sm: 1 }
                  }
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    color: getTextColor(a.color),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    },
                    minWidth: isUserJoining(a) ? { xs: '80px', sm: '50px' } : { xs: '60px', sm: 'auto' },
                    height: { xs: '36px', sm: '24px' },
                    justifyContent: isUserJoining(a)
                      ? 'flex-start'
                      : { xs: 'center', sm: 'flex-start' },
                    gap: 0.5,
                    fontSize: { xs: '0.875rem', sm: '0.75rem' },
                    fontFamily: 'Nunito, sans-serif',
                    padding: { xs: '0 12px', sm: '0 8px' },
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoin(a._id);
                  }}
                >
                  {isUserJoining(a) ? (
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
                    color: getTextColor(a.color),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    },
                    height: { xs: '36px', sm: '24px' },
                    width: { xs: '36px', sm: '24px' },
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.25rem', sm: '1rem' }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(a);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: getTextColor(a.color),
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    },
                    height: { xs: '36px', sm: '24px' },
                    width: { xs: '36px', sm: '24px' },
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.25rem', sm: '1rem' }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a._id);
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
            {a.location}
          </Typography>
          {a.joiners && a.joiners.length > 0 && (
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
              {formatJoiners(a.joiners)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const DayColumn = ({
  date,
  index,
  dayAvailabilities,
  handleDayClick,
  handleEventClick,
  handleDelete,
  handleEdit,
  handleJoin,
  isUserJoining,
  formatJoiners,
  userPreferences,
  isMobile,
  activeEventId,
  darkMode
}) => {
  const containerRef = useRef(null);
  const width = useElementWidth(containerRef);
  const timeRatio = isMobile ? 0.25 : 0.5;
  const timeBoxWidth = width * timeRatio - 16;
  const actionsMaxWidth = isMobile
    ? width - timeBoxWidth - 8
    : width * 0.5 - 8;
  const handleSectionClick = (section, e) => {
    if (!isMobile) {
      handleDayClick(date, section, e);
    }
  };

  return (
    <Grid
      item
      xs={12}
      md
      key={index}
      sx={{
        borderRight: { md: index < 6 ? `1px solid ${darkMode ? '#555' : '#e0e0e0'}` : 'none' },
        borderBottom: { xs: index < 6 ? `1px solid ${darkMode ? '#555' : '#e0e0e0'}` : 'none', md: 'none' },
        '&:last-child': {
          borderRight: 'none',
          borderBottom: 'none'
        },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        width: { xs: '100%', md: 'auto' },
        flex: { xs: 'none', md: 1 },
        height: { xs: 'auto', md: '100%' }
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: darkMode
            ? (isWeekend(date) ? '#383838' : '#303030')
            : isWeekend(date) ? '#F5F5F5' : 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
          minHeight: 0,
          height: { xs: 'auto', md: '100%' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color:
                  date.toDateString() === new Date().toDateString()
                    ? createHighlightColor(userPreferences.color)
                    : darkMode
                    ? '#ddd'
                    : 'inherit',
                fontFamily: 'Nunito, sans-serif',
                transition: 'color 0.5s ease'
              }}
            >
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  date.toDateString() === new Date().toDateString()
                    ? createHighlightColor(userPreferences.color)
                    : darkMode
                    ? '#fff'
                    : 'inherit',
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
              handleDayClick(date, 'day', e);
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Day Section */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            cursor: { xs: 'default', sm: 'pointer' },
            '&:hover': {
              backgroundColor: { xs: 'transparent', sm: 'rgba(0, 0, 0, 0.02)' }
            }
          }}
          onClick={(e) => handleSectionClick('day', e)}
        >
          {dayAvailabilities
            .filter(a => a.section !== 'evening')
            .map((a, idx) => (
              <ColumnEvent
                key={idx}
                availability={a}
                timeBoxWidth={timeBoxWidth}
                actionsMaxWidth={actionsMaxWidth}
                handleJoin={handleJoin}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleEventClick={handleEventClick}
                isUserJoining={isUserJoining}
                formatJoiners={formatJoiners}
                isMobile={isMobile}
                activeEventId={activeEventId}
                darkMode={darkMode}
              />

            ))}
        </Box>
        {/* Evening Section */}
        <Box
          sx={{
            flex: 1,
            mt: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              color: darkMode ? '#ddd' : '#666',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600
            }}
          >
            Evening
          </Typography>
          <Box
            sx={{
              flex: 1,
              cursor: { xs: 'default', sm: 'pointer' },
              '&:hover': {
                backgroundColor: { xs: 'transparent', sm: 'rgba(0, 0, 0, 0.02)' }
              }
            }}
            onClick={(e) => handleSectionClick('evening', e)}
          >
          {dayAvailabilities
            .filter(a => a.section === 'evening')
            .map((a, idx) => (
              <ColumnEvent
                key={idx}
                availability={a}
                timeBoxWidth={timeBoxWidth}
                actionsMaxWidth={actionsMaxWidth}
                handleJoin={handleJoin}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleEventClick={handleEventClick}
                isUserJoining={isUserJoining}
                formatJoiners={formatJoiners}
                isMobile={isMobile}
                activeEventId={activeEventId}
                darkMode={darkMode}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

DayColumn.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  index: PropTypes.number.isRequired,
  dayAvailabilities: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleDayClick: PropTypes.func.isRequired,
  handleEventClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleJoin: PropTypes.func.isRequired,
  isUserJoining: PropTypes.func.isRequired,
  formatJoiners: PropTypes.func.isRequired,
  userPreferences: PropTypes.shape({
    color: PropTypes.string.isRequired,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  activeEventId: PropTypes.string,
  darkMode: PropTypes.bool.isRequired,
};

export default DayColumn;

