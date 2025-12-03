import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const IconHeadset = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 12a8 8 0 1 1 16 0" />
    <rect x="4" y="12" width="3" height="7" rx="1.2" />
    <rect x="17" y="12" width="3" height="7" rx="1.2" />
    <path d="M15 20v1a2 2 0 0 1-2 2h-1" />
  </svg>
)

const IconUser = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="9" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </svg>
)

function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function generateAvatarImage(name) {
  if (!name || typeof document === 'undefined') return null
  
  try {
    const canvas = document.createElement('canvas')
    const size = 80
    canvas.width = size
    canvas.height = size
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    // Background circle
    ctx.fillStyle = '#0A214A'
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Get initials
    const initials = getInitials(name)
    const fontSize = initials.length === 2 ? 28 : 24
    
    ctx.font = `bold ${fontSize}px Inter, system-ui, -apple-system, sans-serif`
    ctx.fillText(initials, size / 2, size / 2)
    
    return canvas.toDataURL()
  } catch (error) {
    console.error('Error generating avatar image:', error)
    return null
  }
}

function TopNavigation({ userName, userTitle, userImage, onLogout, onSupport }) {
  const [avatarImage, setAvatarImage] = useState(null)
  const currentUserName = userName || 'Hamed Khani'
  const initials = getInitials(currentUserName)
  
  useEffect(() => {
    if (userImage) {
      setAvatarImage(userImage)
    } else if (currentUserName && typeof document !== 'undefined') {
      // Generate image after component mounts
      const timer = setTimeout(() => {
        try {
          const generated = generateAvatarImage(currentUserName)
          if (generated) {
            setAvatarImage(generated)
          }
        } catch (error) {
          console.error('Failed to generate avatar:', error)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentUserName, userImage])

  return (
    <header className="top-nav">
      <div className="top-nav__spacer" />

      <div className="top-nav__cluster">
        <button type="button" className="top-nav__profile" aria-label={currentUserName}>
          <span className="top-nav__avatar" aria-hidden="true">
            {userImage ? (
              <img src={userImage} alt={currentUserName} className="top-nav__avatar-img" />
            ) : avatarImage ? (
              <img src={avatarImage} alt={currentUserName} className="top-nav__avatar-img" />
            ) : initials ? (
              <span className="top-nav__avatar-initials">{initials}</span>
            ) : (
              <IconUser />
            )}
          </span>
          <span>
            <strong>{currentUserName}</strong>
            {userTitle ? <small>{userTitle}</small> : null}
          </span>
        </button>

        <button
          type="button"
          className="top-nav__action"
          aria-label="Live support"
          onClick={onSupport}
        >
          <IconHeadset />
        </button>

        <button type="button" className="top-nav__logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

TopNavigation.propTypes = {
  userName: PropTypes.string,
  userTitle: PropTypes.string,
  userImage: PropTypes.string,
  onLogout: PropTypes.func,
  onSupport: PropTypes.func,
}

TopNavigation.defaultProps = {
  userName: 'Hamed Khani',
  userTitle: 'Operations lead',
  onLogout: undefined,
  onSupport: undefined,
}

export default TopNavigation

