import { jsPDF } from "jspdf";
import { useEffect } from "react";

export default function InvoiceCard({ response, amount, metadata, autoDownload }) {

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("DPACOMPASS", 20, 20);

    doc.setFontSize(12);
    doc.text("Invoice", 20, 30);

    doc.line(20, 35, 190, 35);

    doc.setFontSize(11);
    doc.text(`Transaction ID: ${response?.transactionId}`, 20, 50);
    doc.text(`Application ID: ${metadata?.applicationId}`, 20, 60);
    doc.text(`Amount Paid: ₹${amount}`, 20, 70);
    doc.text(`Status: Paid`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 90);

    doc.save(`invoice_${response?.transactionId}.pdf`);
  };

  // ✅ Auto download trigger
  useEffect(() => {
    if (autoDownload && response?.transactionId) {
      generatePDF();
    }
  }, [autoDownload]);

  return (
    <div className="mt-4 p-5 border border-green-600 rounded-xl bg-[#022c22] text-green-300 shadow-md">

      <h3 className="text-lg font-semibold mb-3 text-green-400">
        Payment Successful
      </h3>

      <div className="space-y-1 text-sm">
        <p><span className="text-gray-400">Transaction ID:</span> {response?.transactionId}</p>
        <p><span className="text-gray-400">Application ID:</span> {metadata?.applicationId}</p>
        <p><span className="text-gray-400">Amount Paid:</span> ₹{amount}</p>
        <p><span className="text-gray-400">Date:</span> {new Date().toLocaleString()}</p>
      </div>

      <button
        onClick={generatePDF}
        className="mt-4 px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
      >
        Download Invoice
      </button>
    </div>
  );
}