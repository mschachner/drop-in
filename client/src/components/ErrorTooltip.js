import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';

const ErrorTooltip = ({ message }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX + 12, y: e.clientY + 12 });
    };

    if (message) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [message]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 1500,
      }}
    >
      <Tooltip open title={message} placement="right" arrow>
        <span />
      </Tooltip>
    </div>
  );
};

ErrorTooltip.propTypes = {
  message: PropTypes.string,
};

export default ErrorTooltip;
