export const CATEGORIES = [
  "All", "Interior", "Fashion", "Travel", "Food", "DIY", "Photography", "Typography", "Nature",
];

/** Same list without "All" — used where the person is picking topics of interest, not a filter. */
export const INTEREST_CATEGORIES = CATEGORIES.filter((c) => c !== "All");
