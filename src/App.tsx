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

  // Убеждаемся, что walletService всегда создан
  if (!walletService) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        color: '#1a1a1a',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <h1 style={{ margin: '0 0 1rem 0', color: '#1a1a1a' }}>🚀 MMPad</h1>
          <p style={{ margin: 0, color: '#666' }}>Инициализация...</p>
        </div>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
      <div className="app" style={{ minHeight: '100vh' }}>
        <Header walletService={walletService} />
        <div className="tabs" style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            <CreateTokenForm tokenService={tokenService} walletService={walletService} />
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
