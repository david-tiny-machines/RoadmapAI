import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" 
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        // Added animate-modal-appear class
        className="bg-dark-card rounded-lg p-6 max-w-2xl w-full shadow-xl border border-dark-border transform transition-transform duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-dark-text-heading">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-dark-text-secondary hover:text-dark-text-primary p-1 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
} 