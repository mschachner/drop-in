import React, { memo, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import * as Icons from '@mui/icons-material';
import { getTextColor } from './colorUtils';
import useElementWidth from '../../hooks/useElementWidth';
import useChildrenWidth from '../../hooks/useChildrenWidth';

const Event = memo(({
  event,
  onEventClick,
  onDelete,
  isUserJoining,
  formatJoiners
}) => {
  const paperRef = useRef(null);
  const actionsRef = useRef(null);
  const width = useElementWidth(paperRef);
  const actionsWidth = useChildrenWidth(actionsRef);
  const isMobile = useMediaQuery('(max-width:599px)');
  const timeRatio = isMobile ? 0.25 : 0.5;
  const preferredTimeWidth = width * timeRatio - 16;
  const actionsMaxWidth = isMobile
    ? width - preferredTimeWidth - 8
    : width * 0.5 - 8;
  const actionsContentWidth = actionsWidth > 0
    ? Math.min(actionsWidth, actionsMaxWidth)
    : Math.max(preferredTimeWidth - 8, 0);
  const actionsContainerWidth = actionsContentWidth + 8;
  const shouldWrapActions = actionsWidth > actionsMaxWidth;

  return (
    <Paper
      ref={paperRef}
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
        willChange: 'transform, box-shadow',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          '& .event-actions': {
            opacity: 1
          },
          '& .event-time': {
            transform: 'translateY(-32px)'
          }
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event, e);
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {event.icon && (
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
                {Icons[event.icon] ? (
                  React.createElement(Icons[event.icon], { fontSize: 'small' })
                ) : (
                  <span style={{ fontSize: '1rem' }}>{event.icon}</span>
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
              {event.name}
            </Typography>
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
      <Tooltip title={event.timeSlot} arrow placement="top">
        <Box
          className="event-time"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: `${actionsContainerWidth}px`,
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.235)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            overflow: 'hidden',
            zIndex: 1,
            transition: 'transform 0.2s ease'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              fontFamily: 'Nunito, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {event.timeSlot}
          </Typography>
        </Box>
      </Tooltip>
      <Box
        className="event-actions"
        ref={actionsRef}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 0.5,
          flexWrap: shouldWrapActions ? 'wrap' : 'nowrap',
          width: `${actionsContentWidth}px`,
          maxWidth: `${actionsMaxWidth}px`,
          opacity: 0,
          transition: 'opacity 0.2s ease',
          backgroundColor: event.color,
          padding: '0 4px',
          borderRadius: '12px'
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
            justifyContent: isUserJoining(event)
              ? 'flex-start'
              : { xs: 'center', sm: 'flex-start' },
            gap: 0.5,
            fontSize: '0.75rem',
            fontFamily: 'Nunito, sans-serif',
            padding: '4px 8px',
            borderRadius: '12px'
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
            borderRadius: '12px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event._id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
});

Event.displayName = 'Event';

export default Event; 