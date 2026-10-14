const demoAuditData = {
    audit: {
        url: "http://10.240.10.11:3003/",
        generated_at: "2026-09-07T06:06:05.228469+00:00",
        steps_executed: [
            "STEP-01",
            "STEP-02",
            "STEP-04",
            "STEP-05",
            "STEP-07",
            "STEP-11",
        ],
    },

    // STEP-01
    ui_steps: {
        "STEP-01": {
            step_id: "STEP-01",
            title: "Identify Personal Data Collection Points",
            status: "PASS",

            summary: {
                pages_with_personal_data_collection: 1,
                personal_data_collection_points: 5,
                personal_data_categories: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    state: 1,
                    free_text: 1,
                },
            },

            collection_points: [
                {
                    index: 0,
                    type: "form_field",

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    form: {
                        action: "http://10.240.10.11:3003/submit-contact",
                        method: "POST",
                        form_id: "contact-form",
                    },

                    field: {
                        tag: "input",
                        field_type: "text",
                        name: "full_name",
                        field_id: "full-name",
                        label: "Full Name",
                        placeholder: "Enter your full name",
                        required: true,
                        autocomplete: "name",
                    },

                    personal_data: {
                        category: "name",
                        confidence: 0.98,
                    },
                },

                {
                    index: 1,
                    type: "form_field",

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    form: {
                        action: "http://10.240.10.11:3003/submit-contact",
                        method: "POST",
                        form_id: "contact-form",
                    },

                    field: {
                        tag: "input",
                        field_type: "email",
                        name: "email",
                        field_id: "email",
                        label: "Email Address",
                        placeholder: "Enter your email address",
                        required: true,
                        autocomplete: "email",
                    },

                    personal_data: {
                        category: "email",
                        confidence: 0.99,
                    },
                },

                {
                    index: 2,
                    type: "form_field",

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    form: {
                        action: "http://10.240.10.11:3003/submit-contact",
                        method: "POST",
                        form_id: "contact-form",
                    },

                    field: {
                        tag: "input",
                        field_type: "tel",
                        name: "phone",
                        field_id: "phone",
                        label: "Phone Number",
                        placeholder: "Enter your phone number",
                        required: false,
                        autocomplete: "tel",
                    },

                    personal_data: {
                        category: "phone",
                        confidence: 0.99,
                    },
                },

                {
                    index: 3,
                    type: "form_field",

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    form: {
                        action: "http://10.240.10.11:3003/submit-contact",
                        method: "POST",
                        form_id: "contact-form",
                    },

                    field: {
                        tag: "select",
                        field_type: "select",
                        name: "region",
                        field_id: "region",
                        label: "Region",
                        required: false,
                    },

                    personal_data: {
                        category: "state",
                        confidence: 0.9,
                    },
                },

                {
                    index: 4,
                    type: "form_field",

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    form: {
                        action: "http://10.240.10.11:3003/submit-contact",
                        method: "POST",
                        form_id: "contact-form",
                    },

                    field: {
                        tag: "textarea",
                        field_type: "textarea",
                        name: "message",
                        field_id: "message",
                        label: "Your Message",
                        placeholder: "Enter your message",
                        required: false,
                    },

                    personal_data: {
                        category: "free_text",
                        confidence: 0.75,
                    },
                },
            ],
        },

        // STEP-02
        "STEP-02": {
            step_id: "STEP-02",

            title: "Verify Notice Before or at Personal-Data Collection",

            status: "partial",

            summary: {
                total_collection_points: 5,
                collection_points_with_sufficient_evidence: 0,
                collection_points_with_partial_evidence: 5,
                collection_points_with_insufficient_evidence: 0,
                collection_points_without_notice: 0,
                collection_points_with_failed_timing: 0,
                notices_found: 5,
            },

            collection_points: [
                {
                    index: 0,

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    collection_point: {
                        type: "form_field",
                        category: "name",

                        field: {
                            name: "full_name",
                            label: "Full Name",
                            type: "text",
                        },

                        form: {
                            id: "contact-form",
                        },
                    },

                    status: "partial",

                    notice: {
                        found: true,
                        type: "privacy_notice",
                        text:
                            "privacy notice we collect and process your personal data to provide customer support and respond to your request. the personal information we collect may include your name, email address, phone number and message. we will use your information only for the purposes described in this privacy notice and applicable data protection policy. please read our privacy policy and data protection policy before submitting your information.",
                        url: "http://10.240.10.11:3003/#privacy-policy",
                        visible: true,
                        is_consent_control: false,
                    },

                    timing: {
                        checked: true,
                        visible: true,
                        timing: "before",
                        verified: true,
                        associated_with_collection_point: false,
                    },

                    evidence: {
                        status: "partial",
                        summary:
                            "Partial evidence was identified: the notice was visible, timing was identified as 'before_or_at_collection', data relevance was identified, Step 1 did not provide an explicit purpose.",
                    },
                },

                {
                    index: 1,

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    collection_point: {
                        type: "form_field",
                        category: "email",

                        field: {
                            name: "email",
                            label: "Email Address",
                            type: "email",
                        },

                        form: {
                            id: "contact-form",
                        },
                    },

                    status: "partial",

                    notice: {
                        found: true,
                        type: "privacy_notice",
                        text:
                            "privacy notice we collect and process your personal data to provide customer support and respond to your request. the personal information we collect may include your name, email address, phone number and message. we will use your information only for the purposes described in this privacy notice and applicable data protection policy. please read our privacy policy and data protection policy before submitting your information.",
                        url: "http://10.240.10.11:3003/#privacy-policy",
                        visible: true,
                        is_consent_control: false,
                    },

                    timing: {
                        checked: true,
                        visible: true,
                        timing: "before",
                        verified: true,
                        associated_with_collection_point: false,
                    },

                    evidence: {
                        status: "partial",
                        summary:
                            "Partial evidence was identified: the notice was visible, timing was identified as 'before_or_at_collection', data relevance was identified, Step 1 did not provide an explicit purpose.",
                    },
                },

                {
                    index: 2,

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    collection_point: {
                        type: "form_field",
                        category: "phone",

                        field: {
                            name: "phone",
                            label: "Phone Number",
                            type: "tel",
                        },

                        form: {
                            id: "contact-form",
                        },
                    },

                    status: "partial",

                    notice: {
                        found: true,
                        type: "privacy_notice",
                        text:
                            "privacy notice we collect and process your personal data to provide customer support and respond to your request. the personal information we collect may include your name, email address, phone number and message. we will use your information only for the purposes described in this privacy notice and applicable data protection policy. please read our privacy policy and data protection policy before submitting your information.",
                        url: "http://10.240.10.11:3003/#privacy-policy",
                        visible: true,
                        is_consent_control: false,
                    },

                    timing: {
                        checked: true,
                        visible: true,
                        timing: "before",
                        verified: true,
                        associated_with_collection_point: false,
                    },

                    evidence: {
                        status: "partial",
                        summary:
                            "Partial evidence was identified: the notice was visible, timing was identified as 'before_or_at_collection', data relevance was identified, Step 1 did not provide an explicit purpose.",
                    },
                },

                {
                    index: 3,

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    collection_point: {
                        type: "form_field",
                        category: "state",

                        field: {
                            name: "region",
                            label: "Region",
                            type: "select",
                        },

                        form: {
                            id: "contact-form",
                        },
                    },

                    status: "partial",

                    notice: {
                        found: true,
                        type: "privacy_notice",
                        text:
                            "privacy notice we collect and process your personal data to provide customer support and respond to your request. the personal information we collect may include your name, email address, phone number and message. we will use your information only for the purposes described in this privacy notice and applicable data protection policy. please read our privacy policy and data protection policy before submitting your information.",
                        url: "http://10.240.10.11:3003/#privacy-policy",
                        visible: true,
                        is_consent_control: false,
                    },

                    timing: {
                        checked: true,
                        visible: true,
                        timing: "before",
                        verified: true,
                        associated_with_collection_point: false,
                    },

                    evidence: {
                        status: "partial",
                        summary:
                            "Partial evidence was identified: the notice was visible, timing was identified as 'before_or_at_collection', data relevance was identified, Step 1 did not provide an explicit purpose.",
                    },
                },

                {
                    index: 4,

                    page: {
                        url: "http://10.240.10.11:3003/",
                        title: "DPACOMPASS Consent Management Test Site",
                    },

                    collection_point: {
                        type: "form_field",
                        category: "free_text",

                        field: {
                            name: "message",
                            label: "Your Message",
                            type: "textarea",
                        },

                        form: {
                            id: "contact-form",
                        },
                    },

                    status: "partial",

                    notice: {
                        found: true,
                        type: "privacy_notice",
                        text:
                            "privacy notice we collect and process your personal data to provide customer support and respond to your request. the personal information we collect may include your name, email address, phone number and message. we will use your information only for the purposes described in this privacy notice and applicable data protection policy. please read our privacy policy and data protection policy before submitting your information.",
                        url: "http://10.240.10.11:3003/#privacy-policy",
                        visible: true,
                        is_consent_control: false,
                    },

                    timing: {
                        checked: true,
                        visible: true,
                        timing: "before",
                        verified: true,
                        associated_with_collection_point: false,
                    },

                    evidence: {
                        status: "partial",
                        summary:
                            "Partial evidence was identified: the notice was visible, timing was identified as 'before_or_at_collection', data relevance was identified, Step 1 did not provide an explicit purpose.",
                    },
                },
            ],
        },
        // STEP-04
        // STEP-05
        // STEP-07
        // STEP-11
    },
};

export default demoAuditData;