import React from 'react';
import ReactDOM from 'react-dom/client';
import Calendar from './components/Calendar';
import './index.css';

import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/courgette';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Calendar />); 
