 import RemediationAccordion from "./RemediationAccordion";

const RemediationApplications = () => {

  // Sample Data (replace later with API)
  const submitted = [
    {
      id: 1,
      name: "Payment API",
      date: "2026-05-20",
      status: "Submitted",
    },
  ];

  const ongoing = [
    {
      id: 2,
      name: "User Service",
      date: "2026-05-18",
      status: "In Progress",
    },
  ];

  const completed = [
    {
      id: 3,
      name: "Analytics Engine",
      date: "2026-05-10",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-6">

      <h1 className="text-2xl font-semibold mb-6">
        My Remediation Applications
      </h1>

      <RemediationAccordion
        title="Submitted for Remediation"
        data={submitted}
      />

      <RemediationAccordion
        title="Ongoing Remediation"
        data={ongoing}
      />

      <RemediationAccordion
        title="Completed Remediation"
        data={completed}
      />

    </div>
  );
};

export default RemediationApplications;