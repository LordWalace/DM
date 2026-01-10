// frontend/src/components/NotificationModal.tsx
import React, { useState } from 'react'
import './NotificationModal.css'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    message: string
    type: 'info' | 'warning' | 'success'
  }) => Promise<void>
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Título é obrigatório')
      return
    }

    if (!formData.message.trim()) {
      setError('Mensagem é obrigatória')
      return
    }

    try {
      setLoading(true)
      await onSubmit(formData)
      setFormData({
        title: '',
        message: '',
        type: 'info',
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar notificação')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Notificação</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título da notificação"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Mensagem *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Conteúdo da notificação"
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="info">ℹ️ Informação</option>
              <option value="warning">⚠️ Atenção</option>
              <option value="success">✅ Sucesso</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Notificação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotificationModal