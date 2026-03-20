import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Register service worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('มีเวอร์ชันใหม่ ต้องการอัปเดตหรือไม่? / New version available. Update?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
