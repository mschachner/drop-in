import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Fade } from '@mui/material';
import useMousePosition from '../hooks/useMousePosition';

const ErrorTooltip = ({ message, duration = 3000 }) => {
  const { x, y } = useMousePosition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const timer = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message && !open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 12,
        top: y + 12,
        pointerEvents: 'none',
        zIndex: 1500,
      }}
    >
      <Tooltip
        open={open}
        title={message}
        placement="right"
        arrow
        TransitionComponent={Fade}
      >
        <span />
      </Tooltip>
    </div>
  );
};

ErrorTooltip.propTypes = {
  message: PropTypes.string,
  duration: PropTypes.number,
};

export default ErrorTooltip;
