import { useState } from "react";
import { initiatePayment } from "../services/paymentService";
import { PAYMENT_STATUS } from "../config/paymentConfig";

export default function usePayment() {
  const [status, setStatus] = useState(PAYMENT_STATUS.INIT);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const startPayment = async (payload) => {
    try {
      setStatus(PAYMENT_STATUS.PROCESSING);

      const res = await initiatePayment(payload);

      setResponse(res);
      setStatus(PAYMENT_STATUS.SUCCESS);
    } catch (err) {
      setError(err);
      setStatus(PAYMENT_STATUS.FAILED);
    }
  };

  return {
    status,
    response,
    error,
    startPayment,
  };
}