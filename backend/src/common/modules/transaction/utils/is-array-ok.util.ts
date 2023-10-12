export function isArrayOK<T = any>(value: ArrayLike<any>): boolean {
    return Array.isArray(value) && value.length > 0;
}
