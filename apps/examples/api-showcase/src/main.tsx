import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('container');

if (!container) {
  throw new Error('API showcase container was not found');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
