// frontend/src/components/Card.tsx
import React from 'react'
import './Card.css'

interface CardProps {
  title?: string
  subtitle?: string
  highlight?: string
  footer?: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  highlight,
  footer,
  icon,
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`dm-card ${onClick ? 'dm-card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || icon) && (
        <div className="dm-card-header">
          <div className="dm-card-title-area">
            {icon && <div className="dm-card-icon">{icon}</div>}
            <div>
              {title && <h3 className="dm-card-title">{title}</h3>}
              {subtitle && <p className="dm-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {highlight && <span className="dm-card-highlight">{highlight}</span>}
        </div>
      )}

      {children && <div className="dm-card-body">{children}</div>}

      {footer && <div className="dm-card-footer">{footer}</div>}
    </div>
  )
}

export default Card