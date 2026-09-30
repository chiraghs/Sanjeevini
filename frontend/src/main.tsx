import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Force instant favicon cache invalidation across all browsers
const setFavicon = () => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%23059669'/><rect x='2' y='2' width='60' height='60' rx='12' fill='none' stroke='%2334d399' stroke-width='1.5' stroke-opacity='0.5'/><rect x='26' y='14' width='12' height='36' rx='3.5' fill='%23ffffff'/><rect x='14' y='26' width='36' height='12' rx='3.5' fill='%23ffffff'/><circle cx='32' cy='32' r='3.5' fill='%23059669'/></svg>`;
  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
  link.type = 'image/svg+xml';
  link.rel = 'shortcut icon';
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  document.getElementsByTagName('head')[0].appendChild(link);
};
setFavicon();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
