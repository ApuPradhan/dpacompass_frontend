import { FiCalendar, FiFileText } from "react-icons/fi";
import StatusBadge from "./StatusBadge";


const ApplicationDetails = ({ data }) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-5 mb-6">

      <h2 className="text-lg font-semibold mb-4">
        Application Details
      </h2>

      <div className="grid grid-cols-2 gap-6 text-sm">

        <div>
          <p className="text-gray-400">Application Name</p>
          <p className="text-white">{data.name}</p>
        </div>

        <div>
          <p className="text-gray-400">Type</p>
          <p className="text-white">{data.type}</p>
        </div>

        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400" />
          <span>{data.date}</span>
        </div>

        <div>
          <StatusBadge status={data.status} />
        </div>

      </div>
    </div>
  );
};

export default ApplicationDetails;