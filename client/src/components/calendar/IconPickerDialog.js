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
  '😀','😁','😂','😅','😊','😍','🤔','😎','🥳','🎉','🎁','🎂','🍕','🍔','🍣','🍜',
  '🍻','🍺','☕','🎵','🎸','🎮','🏃','🚴','⚽','🏀','⭐','🌟','🌈','🔥','💻','📱',
  '📚','🎓','✈️','🚀','🚗','🏡','🐶','🐱'
];

const IconPickerDialog = ({ open, onClose, onSelect }) => {
  const [tab, setTab] = useState(0);
  const iconNames = [
    'Home','Work','School','Star','CheckCircle','Event','Alarm','Flight',
    'DirectionsRun','MusicNote','Restaurant','SportsEsports','ShoppingCart',
    'Pets','Face','ThumbUp','Group','Laptop','Book','TravelExplore'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Icon</DialogTitle>
      <Tabs value={tab} onChange={(e,v)=>setTab(v)} centered>
        <Tab label="icons" />
        <Tab label="emoji" />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 ? (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:300, overflowY:'auto' }}>
            {iconNames.map((name) => {
              const IconComp = Icons[name];
              if (!IconComp) return null;
              return (
                <IconButton
                  key={name}
                  onClick={() => {
                    onSelect(name);
                    onClose();
                  }}
                >
                  <IconComp />
                </IconButton>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:300, overflowY:'auto' }}>
            {emojiList.map((emo) => (
              <IconButton
                key={emo}
                onClick={() => {
                  onSelect(emo);
                  onClose();
                }}
                sx={{ color: 'initial' }}
              >
                <span style={{ fontSize: '24px', color: 'initial' }}>{emo}</span>
              </IconButton>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IconPickerDialog;
