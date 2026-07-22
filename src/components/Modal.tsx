import { useEffect, type FormEvent, type ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  confirmText?: string
  confirmDisabled?: boolean
  wide?: boolean
  tall?: boolean
}

export function Modal({
  title,
  children,
  onClose,
  onSubmit,
  confirmText = '确定',
  confirmDisabled = false,
  wide = false,
  tall = false,
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className={`modal-card${wide ? ' modal-card--wide' : ''}${tall ? ' modal-card--tall' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button modal-close" type="button" aria-label="关闭" onClick={onClose}>
            <span aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        <footer className="modal-footer">
          <button className="button button--secondary" type="button" onClick={onClose}>
            取消
          </button>
          <button className="button button--primary" type="submit" disabled={confirmDisabled}>
            {confirmText}
          </button>
        </footer>
      </form>
    </div>
  )
}
