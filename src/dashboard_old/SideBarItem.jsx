const SidebarItem = ({ icon, label , onClick}) => (
  <div onClick={onClick} className="flex items-center text-xl gap-3 px-3 py-2 rounded-lg hover:bg-indigo-500/10 cursor-pointer transition">
    <span className="text-indigo-400">{icon}</span>
    <span>{label}</span>
  </div>
);

export default SidebarItem;