import Sidebar from "../dashboard_old/Sidebar";

export default function DashboardLayout({ role, children }) {
    return (
        <div className="flex min-h-screen bg-[#0b1120] text-gray-200">

            {/* Sidebar */}
            <Sidebar role={role} />

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>

        </div>
    );
}