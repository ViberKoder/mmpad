import { useState, useEffect } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Header from './components/Header'
import CreateTokenForm from './components/CreateTokenForm'
import TokenList from './components/TokenList'
import TradingPanel from './components/TradingPanel'
import { TokenService } from './services/tokenService'
import { WalletService } from './services/walletService'
import { initSDK } from './utils/sdk'
import './styles/App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'trade'>('create')
  const [tokenService, setTokenService] = useState<TokenService | null>(null)
  const [walletService, setWalletService] = useState<WalletService | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    // Создаем WalletService сразу, он не зависит от SDK
    const ws = new WalletService()
    setWalletService(ws)
    
    const init = async () => {
      try {
        const sdk = await initSDK()
        const ts = new TokenService(sdk)
        setTokenService(ts)
        setInitError(null)
      } catch (error) {
        console.error('Failed to initialize SDK:', error)
        setInitError('Не удалось инициализировать SDK. Проверьте консоль браузера для деталей.')
        // Создаем заглушку для TokenService, чтобы UI работал
        // В реальности это не будет работать, но хотя бы форма отобразится
      }
    }
    init()
  }, [])

  return (
    <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
      <div className="app">
        <Header walletService={walletService} />
        <div className="tabs">
          <button 
            className={activeTab === 'create' ? 'active' : ''} 
            onClick={() => setActiveTab('create')}
          >
            Создать токен
          </button>
          <button 
            className={activeTab === 'list' ? 'active' : ''} 
            onClick={() => setActiveTab('list')}
          >
            Список токенов
          </button>
          <button 
            className={activeTab === 'trade' ? 'active' : ''} 
            onClick={() => setActiveTab('trade')}
          >
            Торговля
          </button>
        </div>
        <div className="content">
          {initError && (
            <div style={{ 
              background: '#fee', 
              color: '#c33', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #c33'
            }}>
              ⚠️ {initError}
            </div>
          )}
          {activeTab === 'create' && walletService && (
            tokenService ? (
              <CreateTokenForm tokenService={tokenService} walletService={walletService} />
            ) : (
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <h2>Создать новый токен</h2>
                <p style={{ marginTop: '1rem', color: '#666' }}>
                  Инициализация SDK... Пожалуйста, подождите.
                </p>
                {initError && (
                  <div style={{ 
                    background: '#fee', 
                    color: '#c33', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    marginTop: '1rem',
                    border: '1px solid #c33'
                  }}>
                    ⚠️ {initError}
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Форма будет доступна после инициализации SDK.
                    </p>
                  </div>
                )}
              </div>
            )
          )}
          {activeTab === 'list' && (
            tokenService ? (
              <TokenList tokenService={tokenService} />
            ) : (
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p>Загрузка списка токенов...</p>
              </div>
            )
          )}
          {activeTab === 'trade' && (
            tokenService && walletService ? (
              <TradingPanel tokenService={tokenService} walletService={walletService} />
            ) : (
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p>Загрузка панели торговли...</p>
              </div>
            )
          )}
        </div>
      </div>
    </TonConnectUIProvider>
  )
}

export default App
