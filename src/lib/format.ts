const COUNT_UNITS = ["", "k", "m", "b"] as const;

/** Star and fork totals, compact so six digits do not overflow the card footer.
 *  One decimal below ten keeps 9.5k distinct from 95k.
 *
 *  Same function as the app's `formatCount` in `src/lib/utils.ts`. */
export function formatCount(count: number): string {
    if (count < 1_000) return String(count);

    let unit = 0;
    let scaled = count;
    while (scaled >= 1_000 && unit < COUNT_UNITS.length - 1) {
        scaled /= 1_000;
        unit += 1;
    }

    /* Rounding can push a value into the next unit: 999_600 has to read as
     * "1m", not "1000k". */
    const rounded =
        scaled < 10 ? Math.round(scaled * 10) / 10 : Math.round(scaled);
    if (rounded >= 1_000 && unit < COUNT_UNITS.length - 1) {
        scaled = rounded / 1_000;
        unit += 1;
        return `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}${COUNT_UNITS[unit]}`;
    }

    return Number.isInteger(rounded)
        ? `${rounded}${COUNT_UNITS[unit]}`
        : `${rounded.toFixed(1)}${COUNT_UNITS[unit]}`;
}
