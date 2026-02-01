import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #c33; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 2rem; border-radius: 16px;">
        <h1>Ошибка загрузки</h1>
        <p>Элемент #root не найден</p>
      </div>
    </div>
  `;
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #c33; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 600px;">
          <h1>Ошибка загрузки приложения</h1>
          <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          <p style="margin-top: 1rem; font-size: 0.9rem;">Проверьте консоль браузера (F12) для деталей.</p>
        </div>
      </div>
    `;
  }
}
