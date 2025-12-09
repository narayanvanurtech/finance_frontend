import React from 'react';

interface ConfirmationDialogProps {
  show: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  disableConfirm?: boolean;
  disableCancel?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  disableConfirm = false,
  disableCancel = false
}) => {
  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      case 'success':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      default:
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`${styles.bgColor} p-3 rounded-full`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${styles.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {styles.icon}
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
            {title}
          </h3>
          <div className="text-gray-600 text-center mb-6">
            {message}
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              disabled={disableCancel}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                disableCancel 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={disableConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                styles.buttonColor
              } ${
                disableConfirm 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
