import type { FC } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box" style={{ maxWidth: 400 }}>
        <div className="dialog-header">
          <h3 style={{ color: 'var(--clr-text-main)' }}>{title}</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="dialog-body">
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 24 }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isLoading}
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          >
            {cancelText}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            disabled={isLoading}
            style={{ 
              padding: '8px 20px', 
              fontSize: '0.9rem', 
              backgroundColor: 'var(--clr-danger)' 
            }}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
