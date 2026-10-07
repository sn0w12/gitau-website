export type TextColor = "bright" | "dark";

export function getTextColor(hex: string): TextColor {
    let value = hex.startsWith("#") ? hex.slice(1) : hex;
    if (value.length === 3) {
        value = value
            .split("")
            .map((channel) => channel + channel)
            .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
        return "dark";
    }

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "dark" : "bright";
}
