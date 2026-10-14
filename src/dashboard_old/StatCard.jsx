const StatCard = ({ title, value, icon }) => (
  <div className="bg-[#0f172a]/80 border border-gray-700 rounded-xl p-4 backdrop-blur-lg flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-[12px]">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
    <div className="text-indigo-400 text-xl">{icon}</div>
  </div>
);

export default StatCard;