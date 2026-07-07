import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
// @ts-expect-error: side-effect CSS imports may not have type declarations in this project
import './styles/index.css';
// @ts-expect-error: side-effect CSS imports may not have type declarations in this project
import './styles/editor.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
