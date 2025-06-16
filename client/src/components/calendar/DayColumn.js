import React from 'react';
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
  const handleSectionClick = (section, e) => {
    if (!isMobile) {
      handleDayClick(date, section, e);
    }
  };

  return (
    <Grid
      item
      xs={12}
      sm
      key={index}
      sx={{
        borderRight: { sm: index < 6 ? `1px solid ${darkMode ? '#555' : '#e0e0e0'}` : 'none' },
        borderBottom: { xs: index < 6 ? `1px solid ${darkMode ? '#555' : '#e0e0e0'}` : 'none', sm: 'none' },
        '&:last-child': {
          borderRight: 'none',
          borderBottom: 'none'
        },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        width: { xs: '100%', sm: 'auto' },
        flex: { xs: 'none', sm: 1 },
        height: { xs: 'auto', sm: '100%' }
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
          height: { xs: 'auto', sm: '100%' }
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
              <Paper
                key={idx}
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
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-2px)' },
                    boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.1)', sm: '0 4px 8px rgba(0,0,0,0.15)' },
                    '& .event-actions': {
                      opacity: { xs: 1, sm: 1 }
                    }
                  },
                  className: 'event-paper',
                  '&:hover .time-box': {
                    right: { xs: isUserJoining(a) ? '180px' : '142px', sm: isUserJoining(a) ? '150px' : '112px' }
                  },
                  '&:hover .event-actions': {
                    opacity: { xs: 1, sm: 1 }
                  }
                }}
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
                            pr: 1
                          }}
                        >
                          {a.name}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            minWidth: { xs: '80px', sm: '60px' },
                            height: { xs: '36px', sm: '24px' },
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            padding: { xs: '0 12px', sm: '0 8px' },
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', sm: '0.75rem' },
                            fontFamily: 'Nunito, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: { xs: 'none', sm: 'right 0.3s cubic-bezier(0.4,0,0.2,1)' },
                            zIndex: 2,
                            pointerEvents: 'none',
                            right: isMobile ? (isUserJoining(a) ? '180px' : '142px') : (activeEventId === a._id ? (isUserJoining(a) ? '150px' : '112px') : 0)
                          }}
                          className="time-box"
                        >
                          {a.timeSlot}
                        </Box>
                        <Box
                          className="event-actions"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            gap: 0.5,
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
                              justifyContent: 'flex-start',
                              gap: 0.5,
                              fontSize: { xs: '0.875rem', sm: '0.75rem' },
                              padding: { xs: '0 12px', sm: '0 8px' },
                              borderRadius: '12px',
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
                              borderRadius: '12px',
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
                              borderRadius: '12px',
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
                <Paper
                  key={idx}
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
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-2px)' },
                      boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.1)', sm: '0 4px 8px rgba(0,0,0,0.15)' },
                      '& .event-actions': {
                        opacity: { xs: 1, sm: 1 }
                      }
                    },
                    className: 'event-paper',
                    '&:hover .time-box': {
                      right: { xs: isUserJoining(a) ? '180px' : '142px', sm: isUserJoining(a) ? '150px' : '112px' }
                    },
                    '&:hover .event-actions': {
                      opacity: { xs: 1, sm: 1 }
                    }
                  }}
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
                              pr: 1
                            }}
                          >
                            {a.name}
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              minWidth: { xs: '80px', sm: '60px' },
                              height: { xs: '36px', sm: '24px' },
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              padding: { xs: '0 12px', sm: '0 8px' },
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: '0.75rem' },
                              fontFamily: 'Nunito, sans-serif',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              transition: { xs: 'none', sm: 'right 0.3s cubic-bezier(0.4,0,0.2,1)' },
                              zIndex: 2,
                              pointerEvents: 'none',
                              right: isMobile ? (isUserJoining(a) ? '180px' : '142px') : (activeEventId === a._id ? (isUserJoining(a) ? '150px' : '112px') : 0)
                            }}
                            className="time-box"
                          >
                            {a.timeSlot}
                          </Box>
                          <Box
                            className="event-actions"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              display: 'flex',
                              gap: 0.5,
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
                                justifyContent: 'flex-start',
                                gap: 0.5,
                                fontSize: { xs: '0.875rem', sm: '0.75rem' },
                                padding: { xs: '0 12px', sm: '0 8px' },
                                borderRadius: '12px',
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
                                borderRadius: '12px',
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
                                borderRadius: '12px',
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
              ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

export default DayColumn;

