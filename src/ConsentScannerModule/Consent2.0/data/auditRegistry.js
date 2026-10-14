import website1 from "./auditResults/10.240.10.11_3003.json";

import website2 from "./auditResults/10.240.10.11_3000.json";
import website3 from "./auditResults/http_www.google.com.json";

const auditResults = [
    {
        url: "http://10.240.10.11:3003",
        data: website1,
    },
    {
        url: "http://10.240.10.11:3000",
        data: website2,
    },

    {
        url: "https://www.google.com",
        data: website3,
    },

    // {
    //     url: "https://example-site-3.com",
    //     data: website3,
    // },
];

export const findAuditResult = (inputUrl) => {
    const normalizeUrl = (url) => {
        if (!url) return "";

        return url
            .trim()
            .replace(/\/+$/, "")
            .toLowerCase();
    };

    const normalizedInput = normalizeUrl(inputUrl);

    return (
        auditResults.find(
            (item) =>
                normalizeUrl(item.url) === normalizedInput
        )?.data || null
    );
};