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
    const init = async () => {
      try {
        const sdk = await initSDK()
        const ts = new TokenService(sdk)
        const ws = new WalletService()
        setTokenService(ts)
        setWalletService(ws)
        setInitError(null)
      } catch (error) {
        console.error('Failed to initialize SDK:', error)
        setInitError('Не удалось инициализировать SDK. Проверьте консоль браузера для деталей.')
        // Все равно создаем WalletService, так как он не зависит от SDK
        const ws = new WalletService()
        setWalletService(ws)
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
          {activeTab === 'create' && (
            tokenService ? (
              <CreateTokenForm tokenService={tokenService} walletService={walletService} />
            ) : (
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p>Загрузка формы создания токена...</p>
                {initError && <p style={{ color: '#c33', marginTop: '1rem' }}>{initError}</p>}
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
