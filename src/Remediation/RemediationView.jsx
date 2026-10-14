import { useParams } from "react-router-dom";
import ApplicationDetails from "./ApplicationDetails";
import RemediationChecklist from "./RemediationChecklist";

const RemediationView = () => {
    const { id } = useParams();

    // STATIC DATA (replace with API later)
    const data = {
        id,
        name: "Payment API",
        date: "2026-05-20",
        status: "In Progress", // change to test
        type: "DPACOMPASS",
    };


    const checklist = [
        {
            id: 1,
            rule: "Encrypt PII Data",
            description:
                "Sensitive personal data must be encrypted both at rest and in transit.",
            finding:
                "User data is stored in plain text in the database and APIs are accessible over HTTP.",
            recommendation: {
                summary:
                    "Implement encryption for data at rest and enforce HTTPS for data in transit.",
                steps: [
                    "Use AES-256 encryption for storing sensitive data.",
                    "Enable HTTPS using SSL certificates.",
                    "Hash sensitive fields like passwords using bcrypt.",
                ],
                bestPractices: [
                    "Never store encryption keys in source code",
                    "Use environment variables or secure vaults (AWS KMS, Azure Key Vault)",
                    "Rotate encryption keys periodically",
                    "Enforce TLS 1.2+ for all communications",
                    "Disable weak ciphers and protocols",
                ],
            },
            status: "pending",
        },

        {
            id: 2,
            rule: "Consent Logging",
            description:
                "User consent must be recorded and stored for compliance verification.",
            finding:
                "No mechanism exists to log user consent during registration or data collection.",
            recommendation: {
                summary:
                    "Implement structured consent logging with timestamp and user ID.",
                steps: [
                    "Create a consent tracking table in the database.",
                    "Log user consent during signup or data submission.",
                    "Store timestamp and consent version.",
                ],
                bestPractices: [
                    "Version your consent policies",
                    "Allow users to withdraw consent easily",
                    "Store consent logs immutably (audit logs)",
                    "Ensure consent is explicit (no pre-ticked boxes)",
                    "Audit consent logs periodically",
                ],
            },
            status: "pending",
        },

        {
            id: 3,
            rule: "Access Control Enforcement",
            description:
                "Ensure proper authentication and authorization mechanisms are in place.",
            finding:
                "Unauthorized users can access restricted APIs without proper role validation.",
            recommendation: {
                summary:
                    "Implement role-based access control (RBAC) and authentication checks.",
                steps: [
                    "Add authentication middleware to all protected routes.",
                    "Implement role-based access checks.",
                    "Validate user permissions before processing requests.",
                ],
                bestPractices: [
                    "Use JWT or OAuth2 for secure authentication",
                    "Follow the principle of least privilege",
                    "Regularly review user roles and permissions",
                    "Log all access attempts (success & failure)",
                    "Implement session expiration and refresh tokens",
                ],
            },
            status: "pending",
        },

        {
            id: 4,
            rule: "Data Retention Policy",
            description:
                "Personal data should not be stored longer than necessary.",
            finding:
                "User data is retained indefinitely without any retention policy.",
            recommendation: {
                summary:
                    "Define and enforce a data retention and deletion policy.",
                steps: [
                    "Define retention periods for different data types.",
                    "Implement automated cleanup scripts.",
                    "Allow users to request data deletion.",
                ],
                bestPractices: [
                    "Follow GDPR/DPDP guidelines for data retention",
                    "Use automated schedulers (cron jobs) for cleanup",
                    "Maintain logs of deleted data for audit purposes",
                    "Ensure backups also respect retention policies",
                    "Anonymize data instead of deleting when required",
                ],
            },
            status: "pending",
        },

        {
            id: 5,
            rule: "API Rate Limiting & Abuse Protection",
            description:
                "APIs must be protected against abuse and excessive requests.",
            finding:
                "No rate limiting is implemented, making APIs vulnerable to abuse and DDoS.",
            recommendation: {
                summary:
                    "Implement rate limiting and request throttling mechanisms.",
                steps: [
                    "Add rate limiting middleware to APIs.",
                    "Restrict number of requests per IP/user.",
                    "Monitor abnormal traffic patterns.",
                ],
                bestPractices: [
                    "Use tools like Nginx, API Gateway, or Cloudflare for rate limiting",
                    "Implement exponential backoff strategies",
                    "Log and monitor suspicious activities",
                    "Use CAPTCHA for sensitive endpoints",
                    "Block repeated malicious IPs automatically",
                ],
            },
            status: "pending",
        },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white px-6 py-6">

            <h1 className="text-2xl font-semibold mb-6">
                Remediation Details
            </h1>

            {/* Always show details */}
            <ApplicationDetails data={data} />

            {/* Conditional Checklist */}
            {(data.status === "In Progress" || data.status === "Completed") && (
                <RemediationChecklist checklist={checklist} />
            )}

        </div>
    );
};

export default RemediationView;