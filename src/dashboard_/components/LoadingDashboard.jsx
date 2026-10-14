// dashboard_/components/LoadingDashboard.jsx

export default function LoadingDashboard() {

    return (

        <div className="space-y-6 animate-pulse">

            <div className="h-10 w-72 rounded bg-gray-700" />

            <div className="grid grid-cols-12 gap-6">

                {[1,2,3,4,5,6].map(card => (

                    <div
                        key={card}
                        className="col-span-4"
                    >

                        <div
                            className="h-36 rounded-2xl bg-gray-800"
                        />

                    </div>

                ))}

            </div>

        </div>

    );

}