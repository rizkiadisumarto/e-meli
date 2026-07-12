import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
