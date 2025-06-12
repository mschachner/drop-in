import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton
} from '@mui/material';
import * as Icons from '@mui/icons-material';

const emojiList = [
  '😀','😁','😂','😊','😍','🤔','😎','🎉','🎂','🍕','🍔','🍻','🎵','🏃','⭐','🔥','💻','📚','✈️','🚀'
];

const IconPickerDialog = ({ open, onClose, onSelect }) => {
  const [tab, setTab] = useState(0);
  const iconNames = Object.keys(Icons);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Icon</DialogTitle>
      <Tabs value={tab} onChange={(e,v)=>setTab(v)} centered>
        <Tab label="Icons" />
        <Tab label="Emoji" />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 ? (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:300, overflowY:'auto' }}>
            {iconNames.map((name) => {
              const IconComp = Icons[name];
              return (
                <IconButton key={name} onClick={() => { onSelect(name); onClose(); }}>
                  <IconComp />
                </IconButton>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:300, overflowY:'auto' }}>
            {emojiList.map((emo) => (
              <IconButton key={emo} onClick={() => { onSelect(emo); onClose(); }}>
                <span style={{ fontSize: '24px' }}>{emo}</span>
              </IconButton>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IconPickerDialog;
