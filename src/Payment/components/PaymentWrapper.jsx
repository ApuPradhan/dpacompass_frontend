import { useLocation, useNavigate } from "react-router-dom";
import { PaymentPage } from "../index";

export default function PaymentWrapper() {
    const location = useLocation();
    const navigate = useNavigate();

    const data = location.state;

    // safety check
    if (!data) {
        navigate("/devdashboard");
        return null;
    }

    return (
        <PaymentPage
            amount={data.amount}
            title={data.title}
            metadata={data.metadata}
            onSuccess={() => navigate("/devdashboard")}
        />
    );
}