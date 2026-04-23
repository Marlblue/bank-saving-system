import Modal from './Modal';
import { HiExclamation } from 'react-icons/hi';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="confirm-body">
        <div className="confirm-icon">
          <HiExclamation />
        </div>
        <p className="confirm-message">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
