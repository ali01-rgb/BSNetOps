import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupAuthInterceptor } from './api.js'

// 🔒 Aktifkan auto-redirect ke login kalau token expired/invalid di request manapun
setupAuthInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)