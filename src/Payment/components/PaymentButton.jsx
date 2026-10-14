export default function PaymentButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-violet-600 hover:bg-violet-700 text-white p-2 rounded transition"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}