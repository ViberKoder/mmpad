import { useState, useEffect } from 'react'
import { WalletService } from '../services/walletService'
import './Header.css'

interface HeaderProps {
  walletService: WalletService | null
}

export default function Header({ walletService }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (walletService) {
      setIsConnected(walletService.isConnected())
      const addr = walletService.getAddress()
      setAddress(addr ? addr.toString() : null)

      const unsubscribe = walletService.subscribe(() => {
        setIsConnected(walletService.isConnected())
        const addr = walletService.getAddress()
        setAddress(addr ? addr.toString() : null)
      })

      return unsubscribe
    }
  }, [walletService])

  const handleConnect = async () => {
    if (walletService) {
      try {
        await walletService.connectWallet()
      } catch (error) {
        alert('Ошибка подключения кошелька: ' + (error as Error).message)
      }
    }
  }

  const handleDisconnect = async () => {
    if (walletService) {
      await walletService.disconnectWallet()
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1>🚀 MMPad</h1>
        <div className="wallet-section">
          {isConnected && address ? (
            <>
              <span className="wallet-address">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button onClick={handleDisconnect} className="disconnect-btn">
                Отключить
              </button>
            </>
          ) : (
            <button onClick={handleConnect} className="connect-btn">
              Подключить кошелек
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
