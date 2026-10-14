const InfoCard = ({ label, value, highlight }) => {
  return (
    <div className="bg-[#111827] p-4 rounded-xl border border-gray-700">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-lg font-medium ${
          highlight ? "text-violet-400 capitalize" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default InfoCard;