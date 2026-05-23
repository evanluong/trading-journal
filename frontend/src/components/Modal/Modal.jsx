import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal({ title, headerExtra, wide, onClose, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {headerExtra && <div className={styles.headerExtra}>{headerExtra}</div>}
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  )
}
