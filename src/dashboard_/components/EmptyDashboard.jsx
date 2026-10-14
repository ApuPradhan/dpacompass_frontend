// dashboard_/components/EmptyDashboard.jsx

import { FiInbox } from "react-icons/fi";

export default function EmptyDashboard() {

    return (

        <div
            className="rounded-2xl border border-dashed border-gray-700
            py-24 px-8 text-center"
        >

            <FiInbox
                size={60}
                className="mx-auto text-gray-500"
            />

            <h2 className="text-2xl font-semibold mt-6">

                Dashboard is Empty

            </h2>

            <p className="text-gray-400 mt-3 max-w-lg mx-auto">

                There are currently no widgets assigned to your
                dashboard.

                Once an administrator configures your dashboard,
                they will appear here automatically.

            </p>

        </div>

    );

}