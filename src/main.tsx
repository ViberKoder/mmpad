import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #c33;">
      <h1>Ошибка загрузки приложения</h1>
      <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
      <p style="margin-top: 1rem; font-size: 0.9rem;">Проверьте консоль браузера для деталей.</p>
    </div>
  `;
}
