
import AuditRow from "./AuditRow";

export default function AuditTable({ audits, onView }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-base text-left border-collapse">

                <thead className="bg-[#EAF3FF] text-[#173B70] border-b-2 border-[#C5D9F2]">
                    <tr>
                        <th className="py-4 px-5 text-sm font-bold uppercase tracking-wide">
                            Name
                        </th>

                        <th className="py-4 px-5 text-sm font-bold uppercase tracking-wide">
                            Owner
                        </th>

                        <th className="py-4 px-5 text-sm font-bold uppercase tracking-wide text-center">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#E2EAF4]">
                    {audits.map((audit) => (
                        <AuditRow
                            key={audit.id}
                            audit={audit}
                            onView={onView}
                        />
                    ))}
                </tbody>

            </table>
        </div>
    );
}
