export const IMAGE_PATTERN = /\.(png|jpe?g|webp)$/i;

const VARIANT_PATTERN = /\.\d+w\.(png|jpe?g|webp)$/i;

export function isVariant(name) {
    return VARIANT_PATTERN.test(name);
}

export function variantPath(name, width) {
    return name.replace(IMAGE_PATTERN, `.${width}w.$1`);
}
