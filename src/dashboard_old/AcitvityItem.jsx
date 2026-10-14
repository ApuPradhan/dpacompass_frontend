const ActivityItem = ({ title, status }) => (
  <div className="flex justify-between items-center bg-[#1e293b] px-4 py-3 rounded-lg hover:bg-[#2a3446] transition">
    <span>{title}</span>
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        status === "Completed"
          ? "bg-green-500/20 text-green-400"
          : "bg-yellow-500/20 text-yellow-400"
      }`}
    >
      {status}
    </span>
  </div>
);

export default ActivityItem;