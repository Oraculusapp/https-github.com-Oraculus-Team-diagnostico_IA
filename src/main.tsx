import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Redirección forzada e inmediata a HTTPS para asegurar que las peticiones POST de la API no pierdan su cuerpo al redireccionarse
if (
  typeof window !== 'undefined' && 
  window.location && 
  window.location.protocol === 'http:' && 
  window.location.hostname !== 'localhost' && 
  !window.location.hostname.includes('127.0.0.1')
) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
