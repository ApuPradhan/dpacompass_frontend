
import { FiInbox } from "react-icons/fi";

export default function EmptyDashboard() {
    return (
        <div
            className="rounded-2xl border border-dashed theme-border
            py-24 px-8 text-center theme-bg-card"
        >
            <FiInbox
                size={60}
                className="mx-auto theme-text-muted"
            />

            <h2 className="text-2xl font-semibold mt-6 theme-text-primary">
                Dashboard is Empty
            </h2>

            <p className="theme-text-secondary mt-3 max-w-lg mx-auto">
                There are currently no widgets assigned to your
                dashboard.

                Once an administrator configures your dashboard,
                they will appear here automatically.
            </p>
        </div>
    );
}
