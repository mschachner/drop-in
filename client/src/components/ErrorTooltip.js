import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Fade } from '@mui/material';

/**
 * Shows a temporary tooltip near the cursor when an error message appears.
 * Uses a ref to track cursor position so it doesn't re-render on every mousemove.
 */
const ErrorTooltip = ({ message, duration = 3000 }) => {
  const posRef = useRef({ x: 0, y: 0 });
  const divRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', update, { passive: true });
    return () => window.removeEventListener('mousemove', update);
  }, []);

  useEffect(() => {
    if (!message) return;
    // Snap the tooltip to where the cursor is right now
    if (divRef.current) {
      divRef.current.style.left = `${posRef.current.x + 12}px`;
      divRef.current.style.top = `${posRef.current.y + 12}px`;
    }
    setOpen(true);
    const timer = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message && !open) return null;

  return (
    <div
      ref={divRef}
      style={{
        position: 'fixed',
        left: posRef.current.x + 12,
        top: posRef.current.y + 12,
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
