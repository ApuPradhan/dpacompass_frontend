// src/pages/auditee/LearnDPDP.jsx

import React, { useMemo, useState } from "react";
import {
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    FileText,
    Globe2,
    Info,
    KeyRound,
    Languages,
    LockKeyhole,
    Network,
    Scale,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    X,
} from "lucide-react";


// ============================================================
// OFFICIAL MEITY LINK
// ============================================================

const MEITY_RULES_URL =
    "https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa";


// ============================================================
// 22 SCHEDULED LANGUAGES OF INDIA
// ============================================================

const LANGUAGES = [
    {
        code: "en",
        name: "English",
        nativeName: "English",
    },
    {
        code: "hi",
        name: "Hindi",
        nativeName: "हिन्दी",
    },
    {
        code: "bn",
        name: "Bengali",
        nativeName: "বাংলা",
    },
    {
        code: "as",
        name: "Assamese",
        nativeName: "অসমীয়া",
    },
    {
        code: "ur",
        name: "Urdu",
        nativeName: "اردو",
    },
    {
        code: "gu",
        name: "Gujarati",
        nativeName: "ગુજરાતી",
    },
    {
        code: "mr",
        name: "Marathi",
        nativeName: "मराठी",
    },
    {
        code: "or",
        name: "Odia",
        nativeName: "ଓଡ଼ିଆ",
    },
    {
        code: "pa",
        name: "Punjabi",
        nativeName: "ਪੰਜਾਬੀ",
    },
    {
        code: "sa",
        name: "Sanskrit",
        nativeName: "संस्कृतम्",
    },
    {
        code: "ne",
        name: "Nepali",
        nativeName: "नेपाली",
    },
    {
        code: "kok",
        name: "Konkani",
        nativeName: "कोंकणी",
    },
    {
        code: "ks",
        name: "Kashmiri",
        nativeName: "कॉशुर / كٲشُر",
    },
    {
        code: "mai",
        name: "Maithili",
        nativeName: "मैथिली",
    },
    {
        code: "mni",
        name: "Manipuri",
        nativeName: "মৈতৈলোন্",
    },
    {
        code: "doi",
        name: "Dogri",
        nativeName: "डोगरी",
    },
    {
        code: "te",
        name: "Telugu",
        nativeName: "తెలుగు",
    },
    {
        code: "ta",
        name: "Tamil",
        nativeName: "தமிழ்",
    },
    {
        code: "kn",
        name: "Kannada",
        nativeName: "ಕನ್ನಡ",
    },
    {
        code: "ml",
        name: "Malayalam",
        nativeName: "മലയാളം",
    },
    {
        code: "bodo",
        name: "Bodo",
        nativeName: "बड़ो",
    },
    {
        code: "santhali",
        name: "Santali",
        nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    },
];


// ============================================================
// LANGUAGE CONTENT
// ============================================================

const CONTENT = {
    en: {
        heroBadge: "DPDP LEARNING CENTRE",
        heroTitle: "Learn the Digital Personal Data Protection Framework",
        heroDescription:
            "Understand the key concepts, rights, responsibilities and compliance requirements under India's Digital Personal Data Protection framework.",
        officialRules: "Read Official Rules",
        explore: "Explore DPDP",
        overview: "DPDP at a Glance",
        overviewText:
            "The Digital Personal Data Protection framework establishes rules for processing digital personal data while protecting the rights of individuals.",
        act: "Digital Personal Data Protection Act, 2023",
        rules: "Digital Personal Data Protection Rules, 2025",
        principal: "Data Principal",
        fiduciary: "Data Fiduciary",
        processor: "Data Processor",
        consent: "Consent",
        rights: "Rights of Data Principals",
        responsibilities: "What an Auditee Should Know",
        notice: "Notice & Consent",
        security: "Security & Breach",
        checklist: "Quick Compliance Checklist",
        readMore: "Read the complete rules on the official MeitY website",
    },

    hi: {
        heroBadge: "DPDP लर्निंग सेंटर",
        heroTitle: "डिजिटल व्यक्तिगत डेटा संरक्षण ढांचे को समझें",
        heroDescription:
            "भारत के डिजिटल व्यक्तिगत डेटा संरक्षण ढांचे के अंतर्गत प्रमुख अवधारणाओं, अधिकारों और अनुपालन आवश्यकताओं को समझें।",
        officialRules: "आधिकारिक नियम पढ़ें",
        explore: "DPDP देखें",
        overview: "DPDP एक नज़र में",
        overviewText:
            "डिजिटल व्यक्तिगत डेटा संरक्षण ढांचा डिजिटल व्यक्तिगत डेटा के प्रसंस्करण के लिए नियम निर्धारित करता है और व्यक्तियों के अधिकारों की रक्षा करता है।",
        act: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023",
        rules: "डिजिटल व्यक्तिगत डेटा संरक्षण नियम, 2025",
        principal: "डेटा प्रिंसिपल",
        fiduciary: "डेटा फिड्यूशियरी",
        processor: "डेटा प्रोसेसर",
        consent: "सहमति",
        rights: "डेटा प्रिंसिपल के अधिकार",
        responsibilities: "ऑडिटी को क्या जानना चाहिए",
        notice: "नोटिस और सहमति",
        security: "सुरक्षा और डेटा उल्लंघन",
        checklist: "त्वरित अनुपालन चेकलिस्ट",
        readMore: "MeitY की आधिकारिक वेबसाइट पर पूरे नियम पढ़ें",
    },

    bn: {
        heroBadge: "DPDP লার্নিং সেন্টার",
        heroTitle: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামো জানুন",
        heroDescription:
            "ভারতের ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামোর অধীনে গুরুত্বপূর্ণ ধারণা, অধিকার এবং সম্মতি সংক্রান্ত প্রয়োজনীয়তা বুঝুন।",
        officialRules: "অফিসিয়াল নিয়ম পড়ুন",
        explore: "DPDP দেখুন",
        overview: "DPDP এক নজরে",
        overviewText:
            "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা কাঠামো ডিজিটাল ব্যক্তিগত তথ্য প্রক্রিয়াকরণের নিয়ম নির্ধারণ করে এবং ব্যক্তির অধিকার রক্ষা করে।",
        act: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা আইন, ২০২৩",
        rules: "ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা নিয়ম, ২০২৫",
        principal: "ডেটা প্রিন্সিপাল",
        fiduciary: "ডেটা ফিডিউশিয়ারি",
        processor: "ডেটা প্রসেসর",
        consent: "সম্মতি",
        rights: "ডেটা প্রিন্সিপালের অধিকার",
        responsibilities: "অডিটির যা জানা উচিত",
        notice: "নোটিশ ও সম্মতি",
        security: "নিরাপত্তা ও ডেটা লঙ্ঘন",
        checklist: "দ্রুত কমপ্লায়েন্স চেকলিস্ট",
        readMore: "MeitY-এর অফিসিয়াল ওয়েবসাইটে সম্পূর্ণ নিয়ম পড়ুন",
    },

    as: {
        heroBadge: "DPDP লাৰ্নিং চেণ্টাৰ",
        heroTitle: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামো বুজক",
        heroDescription:
            "ভাৰতৰ ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামোৰ অধীনত থকা গুৰুত্বপূৰ্ণ ধাৰণা, অধিকাৰ আৰু দায়িত্বসমূহ বুজক।",
        officialRules: "চৰকাৰী নিয়ম পঢ়ক",
        explore: "DPDP চাওক",
        overview: "DPDP এক নজৰত",
        overviewText:
            "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা কাঠামোৱে ডিজিটেল ব্যক্তিগত তথ্য প্ৰক্ৰিয়াকৰণৰ নিয়ম নিৰ্ধাৰণ কৰে আৰু ব্যক্তিৰ অধিকাৰ সুৰক্ষিত কৰে।",
        act: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা আইন, ২০২৩",
        rules: "ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা নিয়ম, ২০২৫",
        principal: "ডাটা প্ৰিন্সিপাল",
        fiduciary: "ডাটা ফিডুচিয়াৰী",
        processor: "ডাটা প্ৰচেছৰ",
        consent: "সন্মতি",
        rights: "ডাটা প্ৰিন্সিপালৰ অধিকাৰ",
        responsibilities: "অডিটিয়ে কি জানিব লাগে",
        notice: "জাননী আৰু সন্মতি",
        security: "সুৰক্ষা আৰু ডাটা লংঘন",
        checklist: "দ্ৰুত কমপ্লায়েন্স চেকলিষ্ট",
        readMore: "MeitY-ৰ চৰকাৰী ৱেবছাইটত সম্পূৰ্ণ নিয়ম পঢ়ক",
    },
};


// ============================================================
// FALLBACK LANGUAGE CONTENT
// ============================================================

const FALLBACK_CONTENT = CONTENT.en;


// ============================================================
// REUSABLE CARD
// ============================================================

const InfoCard = ({
    icon: Icon,
    title,
    description,
    number,
    accent = "violet",
}) => {
    const accentClasses = {
        violet:
            "from-violet-500/20 to-fuchsia-500/5 border-violet-500/20",
        blue: "from-blue-500/20 to-cyan-500/5 border-blue-500/20",
        emerald:
            "from-emerald-500/20 to-teal-500/5 border-emerald-500/20",
        amber: "from-amber-500/20 to-orange-500/5 border-amber-500/20",
    };

    const iconClasses = {
        violet: "bg-violet-500/15 text-violet-300",
        blue: "bg-blue-500/15 text-blue-300",
        emerald: "bg-emerald-500/15 text-emerald-300",
        amber: "bg-amber-500/15 text-amber-300",
    };

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl
                border bg-gradient-to-br
                ${accentClasses[accent]}
                bg-white/[0.025]
                p-5
                transition-all duration-300
                hover:-translate-y-1
                hover:bg-white/[0.045]
                hover:shadow-xl hover:shadow-violet-950/20
            `}
        >
            {number && (
                <div className="absolute right-4 top-4 text-3xl font-bold text-white/[0.04]">
                    {number}
                </div>
            )}

            <div
                className={`
                    mb-4 flex h-11 w-11 items-center justify-center
                    rounded-xl ${iconClasses[accent]}
                    transition-transform duration-300
                    group-hover:scale-110
                `}
            >
                <Icon size={21} />
            </div>

            <h3 className="mb-2 text-base font-semibold text-white">
                {title}
            </h3>

            <p className="text-sm leading-6 text-slate-400">
                {description}
            </p>
        </div>
    );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const LearnDPDP = () => {
    const [language, setLanguage] = useState("en");
    const [languageOpen, setLanguageOpen] = useState(false);

    const [search, setSearch] = useState("");

    const t = CONTENT[language] || FALLBACK_CONTENT;

    const selectedLanguage = LANGUAGES.find(
        (item) => item.code === language
    );

    const filteredLanguages = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) return LANGUAGES;

        return LANGUAGES.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.nativeName.toLowerCase().includes(query)
        );
    }, [search]);


    const scrollToContent = () => {
        document
            .getElementById("dpdp-overview")
            ?.scrollIntoView({ behavior: "smooth" });
    };


    return (
        <div className="min-h-screen bg-[#09090f] text-white">

            {/* ==================================================
                BACKGROUND EFFECTS
            ================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-violet-600/10 blur-3xl" />

                <div
                    className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/[0.06] blur-3xl"
                    style={{
                        animation: "pulse 6s ease-in-out infinite",
                    }}
                />

                <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-600/[0.04] blur-3xl" />
            </div>


            {/* ==================================================
                PAGE CONTENT
            ================================================== */}

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* ==================================================
                    TOP BAR
                ================================================== */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                            <ShieldCheck
                                size={20}
                                className="text-violet-300"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">
                                DPACOMPASS
                            </p>

                            <p className="text-xs text-slate-500">
                                Privacy Learning Centre
                            </p>
                        </div>
                    </div>


                    {/* ==================================================
                        LANGUAGE SELECTOR
                    ================================================== */}

                    <div className="relative">

                        <button
                            onClick={() =>
                                setLanguageOpen((prev) => !prev)
                            }
                            className="
                                flex items-center gap-2 rounded-xl
                                border border-white/10
                                bg-white/[0.04]
                                px-4 py-2.5
                                text-sm text-slate-200
                                transition-all
                                hover:border-violet-500/30
                                hover:bg-white/[0.07]
                            "
                        >
                            <Languages
                                size={17}
                                className="text-violet-300"
                            />

                            <span>
                                {selectedLanguage?.nativeName}
                            </span>

                            <ChevronDown
                                size={15}
                                className={`transition-transform ${
                                    languageOpen
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>


                        {languageOpen && (
                            <>

                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() =>
                                        setLanguageOpen(false)
                                    }
                                />

                                <div
                                    className="
                                        absolute right-0 z-50 mt-2
                                        w-80 max-w-[calc(100vw-2rem)]
                                        overflow-hidden rounded-2xl
                                        border border-white/10
                                        bg-[#11111a]
                                        shadow-2xl shadow-black/50
                                    "
                                >

                                    {/* Search */}

                                    <div className="border-b border-white/10 p-3">

                                        <div className="relative">

                                            <Search
                                                size={16}
                                                className="
                                                    absolute left-3 top-1/2
                                                    -translate-y-1/2
                                                    text-slate-500
                                                "
                                            />

                                            <input
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Search language..."
                                                className="
                                                    w-full rounded-xl
                                                    border border-white/10
                                                    bg-white/[0.04]
                                                    py-2.5 pl-9 pr-3
                                                    text-sm text-white
                                                    outline-none
                                                    placeholder:text-slate-600
                                                    focus:border-violet-500/40
                                                "
                                            />

                                        </div>

                                    </div>


                                    {/* Languages */}

                                    <div className="max-h-80 overflow-y-auto p-2">

                                        {filteredLanguages.map(
                                            (item) => (
                                                <button
                                                    key={item.code}
                                                    onClick={() => {
                                                        setLanguage(
                                                            item.code
                                                        );
                                                        setLanguageOpen(
                                                            false
                                                        );
                                                        setSearch("");
                                                    }}
                                                    className={`
                                                        flex w-full
                                                        items-center
                                                        justify-between
                                                        rounded-xl
                                                        px-3 py-2.5
                                                        text-left
                                                        transition-colors
                                                        ${
                                                            language ===
                                                            item.code
                                                                ? "bg-violet-500/15 text-violet-200"
                                                                : "text-slate-300 hover:bg-white/[0.05]"
                                                        }
                                                    `}
                                                >
                                                    <span className="text-sm">
                                                        {item.name}
                                                    </span>

                                                    <span className="text-sm text-slate-500">
                                                        {
                                                            item.nativeName
                                                        }
                                                    </span>
                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>

                            </>
                        )}

                    </div>

                </div>


                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/[0.12] via-[#11111a] to-fuchsia-600/[0.05]">

                    {/* Grid */}

                    <div
                        className="
                            pointer-events-none absolute inset-0 opacity-[0.07]
                            [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)]
                            [background-size:40px_40px]
                        "
                    />

                    <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">

                        <div className="max-w-4xl">

                            {/* Badge */}

                            <div
                                className="
                                    mb-6 inline-flex items-center gap-2
                                    rounded-full
                                    border border-violet-400/20
                                    bg-violet-500/10
                                    px-3 py-1.5
                                    text-xs font-medium
                                    tracking-wide text-violet-300
                                "
                            >
                                <BookOpen size={14} />

                                {t.heroBadge}
                            </div>


                            {/* Heading */}

                            <h1
                                className="
                                    max-w-4xl
                                    text-4xl font-bold
                                    leading-tight tracking-tight
                                    text-white
                                    sm:text-5xl lg:text-6xl
                                "
                            >
                                {t.heroTitle}
                            </h1>


                            {/* Description */}

                            <p
                                className="
                                    mt-6 max-w-3xl
                                    text-base leading-7
                                    text-slate-400
                                    sm:text-lg
                                "
                            >
                                {t.heroDescription}
                            </p>


                            {/* Actions */}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                <button
                                    onClick={scrollToContent}
                                    className="
                                        inline-flex items-center
                                        justify-center gap-2
                                        rounded-xl
                                        bg-violet-600
                                        px-5 py-3
                                        text-sm font-semibold
                                        text-white
                                        shadow-lg shadow-violet-950/30
                                        transition-all duration-300
                                        hover:bg-violet-500
                                        hover:-translate-y-0.5
                                    "
                                >
                                    <BookOpen size={17} />

                                    {t.explore}
                                </button>


                                <a
                                    href={MEITY_RULES_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        inline-flex items-center
                                        justify-center gap-2
                                        rounded-xl
                                        border border-white/10
                                        bg-white/[0.04]
                                        px-5 py-3
                                        text-sm font-semibold
                                        text-slate-200
                                        transition-all duration-300
                                        hover:border-violet-500/30
                                        hover:bg-white/[0.07]
                                    "
                                >
                                    <FileText size={17} />

                                    {t.officialRules}

                                    <ArrowUpRight size={15} />
                                </a>

                            </div>

                        </div>


                        {/* Decorative icon */}

                        <div
                            className="
                                pointer-events-none absolute
                                -bottom-12 -right-8
                                hidden lg:block
                            "
                        >
                            <div
                                className="
                                    flex h-64 w-64
                                    items-center justify-center
                                    rounded-full
                                    border border-violet-400/10
                                    bg-violet-500/[0.03]
                                "
                            >
                                <ShieldCheck
                                    size={130}
                                    strokeWidth={1}
                                    className="text-violet-400/20"
                                />
                            </div>
                        </div>

                    </div>
                </section>


                {/* ==================================================
                    OVERVIEW
                ================================================== */}

                <section id="dpdp-overview" className="mb-14">

                    <div className="mb-7">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            01 · FOUNDATION
                        </p>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {t.overview}
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            {t.overviewText}
                        </p>

                    </div>


                    <div className="grid gap-4 md:grid-cols-2">

                        <InfoCard
                            icon={Scale}
                            title={t.act}
                            description="The primary legislation establishing the legal framework for processing digital personal data in India and protecting the rights of Data Principals."
                            accent="violet"
                            number="01"
                        />

                        <InfoCard
                            icon={FileCheck2}
                            title={t.rules}
                            description="The Rules provide operational requirements and procedures for implementing important provisions of the DPDP framework."
                            accent="blue"
                            number="02"
                        />

                    </div>

                </section>


                {/* ==================================================
                    KEY TERMS
                ================================================== */}

                <section className="mb-14">

                    <div className="mb-7">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            02 · CORE CONCEPTS
                        </p>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            Know the terminology
                        </h2>

                    </div>


                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <InfoCard
                            icon={UserCheck}
                            title={t.principal}
                            description="The individual to whom the personal data relates."
                            accent="violet"
                            number="01"
                        />

                        <InfoCard
                            icon={Network}
                            title={t.fiduciary}
                            description="The person or organisation that determines the purpose and means of processing personal data."
                            accent="blue"
                            number="02"
                        />

                        <InfoCard
                            icon={Users}
                            title={t.processor}
                            description="A person or organisation that processes personal data on behalf of a Data Fiduciary."
                            accent="emerald"
                            number="03"
                        />

                        <InfoCard
                            icon={KeyRound}
                            title={t.consent}
                            description="Consent should be appropriately informed, specific and capable of being withdrawn."
                            accent="amber"
                            number="04"
                        />

                    </div>

                </section>


                {/* ==================================================
                    RIGHTS
                ================================================== */}

                <section className="mb-14">

                    <div className="mb-7">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            03 · DATA PRINCIPAL
                        </p>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {t.rights}
                        </h2>

                    </div>


                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {[
                            {
                                icon: Search,
                                title: "Access Information",
                                text: "Understand what personal data is being processed and relevant information about its processing.",
                            },
                            {
                                icon: FileCheck2,
                                title: "Correction & Erasure",
                                text: "Individuals can exercise applicable rights relating to correction and erasure of personal data.",
                            },
                            {
                                icon: UserCheck,
                                title: "Grievance Redressal",
                                text: "A mechanism should exist for Data Principals to raise grievances relating to personal data processing.",
                            },
                            {
                                icon: X,
                                title: "Withdraw Consent",
                                text: "Where processing is based on consent, the Data Principal may withdraw that consent.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Protection",
                                text: "Personal data should be handled in accordance with applicable requirements under the DPDP framework.",
                            },
                            {
                                icon: Info,
                                title: "Clear Information",
                                text: "Information provided to individuals should be clear and understandable.",
                            },
                        ].map((item, index) => (
                            <InfoCard
                                key={item.title}
                                icon={item.icon}
                                title={item.title}
                                description={item.text}
                                number={`0${index + 1}`}
                                accent={
                                    index % 3 === 0
                                        ? "violet"
                                        : index % 3 === 1
                                        ? "blue"
                                        : "emerald"
                                }
                            />
                        ))}

                    </div>

                </section>


                {/* ==================================================
                    AUDITEE RESPONSIBILITIES
                ================================================== */}

                <section className="mb-14">

                    <div className="mb-7">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            04 · AUDITEE
                        </p>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {t.responsibilities}
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            Organisations handling personal data should establish appropriate
                            governance, security and operational controls.
                        </p>

                    </div>


                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

                        {[
                            "Know what personal data your organisation collects and why it is collected.",
                            "Maintain appropriate notices and consent mechanisms where required.",
                            "Limit collection and processing to legitimate and defined purposes.",
                            "Implement reasonable security safeguards for personal data.",
                            "Maintain mechanisms for handling Data Principal requests and grievances.",
                            "Establish appropriate data retention and deletion practices.",
                            "Maintain appropriate records, policies and evidence of compliance.",
                            "Have processes to identify, manage and respond to personal data breaches.",
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="
                                    flex gap-4
                                    border-b border-white/[0.06]
                                    px-5 py-4
                                    last:border-b-0
                                    transition-colors
                                    hover:bg-white/[0.025]
                                "
                            >
                                <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />

                                <p className="text-sm leading-6 text-slate-300">
                                    {item}
                                </p>

                            </div>
                        ))}

                    </div>

                </section>


                {/* ==================================================
                    NOTICE + CONSENT
                ================================================== */}

                <section className="mb-14">

                    <div className="grid gap-5 lg:grid-cols-2">

                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-6">

                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                                <ClipboardCheck size={21} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                {t.notice}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Before or at the time of collecting personal data,
                                organisations should provide appropriate information
                                regarding the processing, where required by the applicable
                                framework.
                            </p>

                            <div className="mt-5 space-y-3">

                                {[
                                    "Purpose of processing",
                                    "Information about the personal data being processed",
                                    "Relevant rights and mechanisms",
                                    "Clear and understandable communication",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-slate-300"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="text-violet-400"
                                        />

                                        {item}
                                    </div>
                                ))}

                            </div>

                        </div>


                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-6">

                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                                <LockKeyhole size={21} />
                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                {t.security}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Organisations should establish reasonable safeguards
                                designed to protect personal data against unauthorised
                                processing, loss or compromise.
                            </p>

                            <div className="mt-5 space-y-3">

                                {[
                                    "Access control",
                                    "Security safeguards",
                                    "Incident response",
                                    "Breach management",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-slate-300"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-400"
                                        />

                                        {item}
                                    </div>
                                ))}

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    QUICK CHECKLIST
                ================================================== */}

                <section className="mb-14">

                    <div className="mb-7">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            05 · SELF CHECK
                        </p>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            {t.checklist}
                        </h2>

                    </div>


                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                        {[
                            "Personal data inventory available",
                            "Privacy notice implemented",
                            "Consent mechanism reviewed",
                            "Data processing purposes documented",
                            "Security safeguards implemented",
                            "Access controls configured",
                            "Data retention practices defined",
                            "Grievance mechanism available",
                            "Breach response process established",
                        ].map((item) => (
                            <div
                                key={item}
                                className="
                                    flex items-center gap-3
                                    rounded-xl
                                    border border-white/10
                                    bg-white/[0.025]
                                    px-4 py-3.5
                                    transition-all
                                    hover:border-violet-500/20
                                    hover:bg-violet-500/[0.04]
                                "
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <CheckCircle2
                                        size={15}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <span className="text-sm text-slate-300">
                                    {item}
                                </span>

                            </div>
                        ))}

                    </div>

                </section>


                {/* ==================================================
                    OFFICIAL MEITY CTA
                ================================================== */}

                <section className="mb-10 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-600/15 via-violet-500/[0.06] to-fuchsia-500/[0.08]">

                    <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">

                        <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                                <Globe2 size={22} />
                            </div>

                            <div>

                                <h3 className="text-lg font-semibold text-white">
                                    {t.readMore}
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Refer to the official Ministry of Electronics
                                    and Information Technology publication for the
                                    complete text.
                                </p>

                            </div>

                        </div>


                        <a
                            href={MEITY_RULES_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                inline-flex shrink-0
                                items-center justify-center
                                gap-2 rounded-xl
                                bg-white px-5 py-3
                                text-sm font-semibold
                                text-slate-900
                                transition-all
                                hover:-translate-y-0.5
                                hover:bg-slate-100
                                hover:shadow-xl
                            "
                        >
                            Read on MeitY

                            <ArrowUpRight size={16} />

                        </a>

                    </div>

                </section>


                {/* ==================================================
                    FOOTER NOTE
                ================================================== */}

                <div className="pb-8 text-center">

                    <p className="text-xs leading-5 text-slate-600">
                        This learning page provides a simplified overview for
                        educational and compliance-awareness purposes. Refer to
                        the official legislation and rules for authoritative
                        legal requirements.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default LearnDPDP;