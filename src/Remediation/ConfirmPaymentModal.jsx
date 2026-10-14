const ConfirmPaymentModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 w-full max-w-md">

        <h2 className="text-lg font-semibold text-white mb-3">
          Confirm Payment
        </h2>

        <p className="text-gray-400 text-sm mb-5">
          Once you proceed to payment, the application details cannot be modified.
          Do you want to continue?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded text-gray-300"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 rounded text-white"
          >
            Yes, Proceed
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmPaymentModal;