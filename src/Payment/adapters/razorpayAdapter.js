export const razorpayPayment = async (payload) => {
  return new Promise((resolve, reject) => {
    try {
      const options = {
        key: "YOUR_KEY_ID",
        amount: payload.amount * 100,
        currency: "INR",
        name: "DPACOMPASS",
        description: payload.title || "Payment",
        handler: function (response) {
          resolve({
            status: "success",
            transactionId: response.razorpay_payment_id,
          });
        },
        prefill: {
          name: "User",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      reject({
        status: "failed",
        message: "Razorpay init failed",
      });
    }
  });
};