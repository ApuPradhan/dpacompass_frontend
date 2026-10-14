export default function PaymentSummary({ amount, title }) {
  return (
    <div className="p-4 rounded-lg bg-gray-900 text-white shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-gray-300">Amount: ₹{amount}</p>
    </div>
  );
}