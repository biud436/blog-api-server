/**
 * 배열이 존재하고, 길이가 0보다 큰지 확인합니다.
 *
 * @param value
 * @returns
 */
export function isArrayOK<T = any>(value: ArrayLike<any>): boolean {
    return Array.isArray(value) && value.length > 0;
}
