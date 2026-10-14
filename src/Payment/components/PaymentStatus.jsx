export default function PaymentStatus({ status, response, error }) {
  if (status === "processing") {
    return <p className="text-yellow-400">Processing payment...</p>;
  }

  if (status === "success") {
    return (
      <div className="text-green-400">
        <p>Payment Successful</p>
        <p className="text-sm">Txn ID: {response?.transactionId}</p>
      </div>
    );
  }

  if (status === "failed") {
    return <p className="text-red-400">{error?.message}</p>;
  }

  return null;
  
}