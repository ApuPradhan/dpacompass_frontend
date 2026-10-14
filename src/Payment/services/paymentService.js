import { PAYMENT_PROVIDER } from "../config/paymentConfig";
import { mockPayment } from "../adapters/mockAdapter";
import { razorpayPayment } from "../adapters/razorpayAdapter";

export const initiatePayment = async (payload) => {
  switch (PAYMENT_PROVIDER) {
    case "mock":
      return await mockPayment(payload);

    case "razorpay":
      return await razorpayPayment(payload);

    default:
      throw new Error("Unsupported payment provider");
  }
};