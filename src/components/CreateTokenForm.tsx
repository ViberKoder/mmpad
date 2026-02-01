import { useState } from 'react'
import { TokenService, CreateTokenParams } from '../services/tokenService'
import { WalletService } from '../services/walletService'
import './CreateTokenForm.css'

interface CreateTokenFormProps {
  tokenService: TokenService | null
  walletService: WalletService | null
}

export default function CreateTokenForm({ tokenService, walletService }: CreateTokenFormProps) {
  const [formData, setFormData] = useState<CreateTokenParams>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    initialBuyAmount: undefined
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!tokenService) {
      setError('Сервис токенов не инициализирован. Пожалуйста, подождите...')
      return
    }

    if (!walletService || !walletService.isConnected()) {
      setError('Пожалуйста, подключите кошелек')
      return
    }

    if (!formData.name || !formData.symbol) {
      setError('Заполните все обязательные поля')
      return
    }

    setLoading(true)

    try {
      const sender = walletService.getSender()
      if (!sender.address) {
        setError('Адрес кошелька не найден')
        return
      }
      
      try {
        await tokenService.createToken(sender, formData)
        setSuccess(true)
        setFormData({
          name: '',
          symbol: '',
          description: '',
          imageUrl: '',
          initialBuyAmount: undefined
        })
      } catch (err) {
        const errorMsg = (err as Error).message
        // Если это сообщение об успешном создании, показываем его как успех
        if (errorMsg.includes('создан') || errorMsg.includes('отправлена')) {
          setSuccess(true)
          setFormData({
            name: '',
            symbol: '',
            description: '',
            imageUrl: '',
            initialBuyAmount: undefined
          })
        } else {
          setError(errorMsg)
        }
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-token-form">
      <h2>Создать новый токен</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название токена *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: My Meme Token"
            required
          />
        </div>

        <div className="form-group">
          <label>Символ токена *</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            placeholder="Например: MEME"
            maxLength={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Описание вашего токена"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>URL изображения</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.png"
          />
        </div>

        <div className="form-group">
          <label>Первоначальная покупка (TON, опционально)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.initialBuyAmount ? Number(formData.initialBuyAmount) / 1e9 : ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                initialBuyAmount: value ? BigInt(Math.floor(parseFloat(value) * 1e9)) : undefined
              })
            }}
            placeholder="0.0"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Токен создан! Транзакция отправлена.</div>}

        <button type="submit" disabled={loading || !tokenService} className="submit-btn">
          {loading ? 'Создание...' : tokenService ? 'Создать токен' : 'Ожидание инициализации...'}
        </button>
      </form>
    </div>
  )
}
