import { useState, useEffect } from 'react'
import { TokenService, TokenInfo } from '../services/tokenService'
import './TokenList.css'

interface TokenListProps {
  tokenService: TokenService
}

export default function TokenList({ tokenService }: TokenListProps) {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    setLoading(true)
    setError(null)
    try {
      const tokenList = await tokenService.getTokenList()
      setTokens(tokenList)
    } catch (err) {
      setError('Ошибка загрузки токенов: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="token-list loading">Загрузка токенов...</div>
  }

  if (error) {
    return (
      <div className="token-list">
        <div className="error-message">{error}</div>
        <button onClick={loadTokens} className="retry-btn">Повторить</button>
      </div>
    )
  }

  return (
    <div className="token-list">
      <div className="token-list-header">
        <h2>Список токенов</h2>
        <button onClick={loadTokens} className="refresh-btn">Обновить</button>
      </div>
      {tokens.length === 0 ? (
        <div className="empty-state">Токены не найдены</div>
      ) : (
        <div className="tokens-grid">
          {tokens.map((token) => (
            <div key={token.address.toString()} className="token-card">
              {token.imageUrl && (
                <img src={token.imageUrl} alt={token.name} className="token-image" />
              )}
              <div className="token-info">
                <h3>{token.name}</h3>
                <p className="token-symbol">{token.symbol}</p>
                {token.description && <p className="token-description">{token.description}</p>}
                {token.price && (
                  <p className="token-price">Цена: {token.price.toFixed(6)} TON</p>
                )}
                <p className="token-address">
                  {token.address.toString().slice(0, 8)}...{token.address.toString().slice(-8)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
