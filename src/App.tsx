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
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'trade'>('list')
  const [tokenService, setTokenService] = useState<TokenService | null>(null)
  const [walletService, setWalletService] = useState<WalletService | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const sdk = await initSDK()
        const ts = new TokenService(sdk)
        const ws = new WalletService()
        setTokenService(ts)
        setWalletService(ws)
      } catch (error) {
        console.error('Failed to initialize SDK:', error)
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
          {activeTab === 'create' && tokenService && (
            <CreateTokenForm tokenService={tokenService} walletService={walletService} />
          )}
          {activeTab === 'list' && tokenService && (
            <TokenList tokenService={tokenService} />
          )}
          {activeTab === 'trade' && tokenService && walletService && (
            <TradingPanel tokenService={tokenService} walletService={walletService} />
          )}
        </div>
      </div>
    </TonConnectUIProvider>
  )
}

export default App
