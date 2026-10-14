import ChecklistItem from "./ChecklistItem";

const RemediationChecklist = ({ checklist }) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-5">

      <h2 className="text-lg font-semibold mb-4">
        Remediation Checklist
      </h2>

      <div className="space-y-3">
        {checklist.map((item) => (
          <ChecklistItem key={item.id} item={item} />
        ))}
      </div>

    </div>
  );
};

export default RemediationChecklist;