export default function AuditRow({ audit, index, onView, onStart }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-[#1e293b]/40 transition">
      
      <td className="px-4 py-3">{index + 1}</td>

      <td className="px-4 py-3 font-medium">
        {audit.name}
      </td>

      <td className="px-4 py-3 text-gray-300">
        {audit.department}
      </td>

      <td className="px-4 py-3">
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
          {audit.status}
        </span>
      </td>

      <td className="px-4 py-3 text-right space-x-3">
        
        <button
          onClick={() => onView(audit)}
          className="text-indigo-400 hover:text-indigo-300"
        >
          View
        </button>

        <button
          onClick={() => onStart(audit.id)}
          className="px-3 py-1 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 text-white text-xs"
        >
          Start
        </button>

      </td>
    </tr>
  );
}