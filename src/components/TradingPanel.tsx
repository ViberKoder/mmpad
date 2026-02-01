import { useState, useEffect } from 'react'
import { Address } from '@ton/core'
import { TokenService } from '../services/tokenService'
import { WalletService } from '../services/walletService'
import './TradingPanel.css'

interface TradingPanelProps {
  tokenService: TokenService
  walletService: WalletService
}

export default function TradingPanel({ tokenService, walletService }: TradingPanelProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [balance, setBalance] = useState<bigint>(0n)
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (tokenAddress && walletService.isConnected()) {
      loadBalance()
    }
  }, [tokenAddress, walletService])

  const loadBalance = async () => {
    if (!tokenAddress || !walletService.isConnected()) return

    try {
      const addr = Address.parse(tokenAddress)
      const userAddr = walletService.getAddress()
      if (userAddr) {
        const bal = await tokenService.getUserBalance(addr, userAddr)
        setBalance(bal)
      }
    } catch (err) {
      console.error('Error loading balance:', err)
    }
  }

  const handleBuy = async () => {
    if (!tokenAddress || !buyAmount) {
      setError('Заполните адрес токена и сумму покупки')
      return
    }

    if (!walletService.isConnected()) {
      setError('Подключите кошелек')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const addr = Address.parse(tokenAddress)
      const sender = walletService.getSender()
      const tons = BigInt(Math.floor(parseFloat(buyAmount) * 1e9))
      
      await tokenService.buyTokens(addr, sender, tons)
      setSuccess('Покупка выполнена!')
      setBuyAmount('')
      await loadBalance()
    } catch (err) {
      setError('Ошибка покупки: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSell = async () => {
    if (!tokenAddress || !sellAmount) {
      setError('Заполните адрес токена и количество для продажи')
      return
    }

    if (!walletService.isConnected()) {
      setError('Подключите кошелек')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const addr = Address.parse(tokenAddress)
      const userAddr = walletService.getAddress()
      if (!userAddr) {
        throw new Error('Адрес кошелька не найден')
      }

      const coins = BigInt(Math.floor(parseFloat(sellAmount) * 1e9))
      await tokenService.sellTokens(addr, userAddr, coins)
      setSuccess('Продажа выполнена!')
      setSellAmount('')
      await loadBalance()
    } catch (err) {
      setError('Ошибка продажи: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trading-panel">
      <h2>Торговля токенами</h2>

      <div className="trading-section">
        <div className="form-group">
          <label>Адрес токена</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="EQBSMwczMFUb789uqNvebKBvemkRaAQJdzTFq6565Ef9rW2k"
          />
        </div>

        {walletService.isConnected() && tokenAddress && (
          <div className="balance-info">
            <p>Ваш баланс: {Number(balance) / 1e9} токенов</p>
          </div>
        )}

        <div className="trade-actions">
          <div className="buy-section">
            <h3>Купить</h3>
            <div className="form-group">
              <label>Сумма в TON</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <button onClick={handleBuy} disabled={loading} className="buy-btn">
              {loading ? 'Обработка...' : 'Купить'}
            </button>
          </div>

          <div className="sell-section">
            <h3>Продать</h3>
            <div className="form-group">
              <label>Количество токенов</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <button onClick={handleSell} disabled={loading} className="sell-btn">
              {loading ? 'Обработка...' : 'Продать'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  )
}
