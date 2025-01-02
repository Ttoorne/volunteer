import React from "react";

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md mx-4 md:max-w-lg">
        <div className="flex items-center text-sm md:text-base">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0 mr-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{message}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            className="btn btn-base btn-primary text-gray-100 rounded-full px-4 py-2 sm:py-1 sm:text-sm"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="btn btn-base btn-neutral text-gray-300 rounded-full px-4 py-2 sm:py-1 sm:text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
