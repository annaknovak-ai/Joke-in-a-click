import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts are bundled locally (no Google Fonts) so the UI works offline
import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-500.css';
import '@fontsource/heebo/hebrew-700.css';
import '@fontsource/heebo/latin-400.css';
import '@fontsource/heebo/latin-700.css';
import '@fontsource/assistant/hebrew-400.css';
import '@fontsource/assistant/latin-400.css';

import './App.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
