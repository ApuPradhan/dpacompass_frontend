// dashboard_/utils/layoutUtils.js

/**
 * Returns the correct Tailwind column span class.
 * Avoids using dynamic class names like col-span-${n},
 * which Tailwind won't generate in production builds.
 */

export function getColumnSpan(cols = 4) {
    const spans = {
        1: "col-span-4",
        2: "col-span-4",
        3: "col-span-4",
        4: "col-span-4",
        5: "col-span-12 xl:col-span-5",
        6: "col-span-12 xl:col-span-6",
        7: "col-span-12 xl:col-span-7",
        8: "col-span-12 xl:col-span-8",
        9: "col-span-12 xl:col-span-9",
        10: "col-span-12 xl:col-span-10",
        11: "col-span-12 xl:col-span-11",
        12: "col-span-12",
    };

    return spans[cols] || spans[4];
}