export const mockPayment = ({ amount, metadata }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.2;

      if (success) {
        resolve({
          status: "success",
          transactionId: "TXN_" + Date.now(),
          amount,
          metadata,
        });
      } else {
        reject({
          status: "failed",
          message: "Payment failed. Try again.",
        });
      }
    }, 2000);
  });
};