export function deepFreeze<T>(value: T): T {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value as object).forEach((nested) => deepFreeze(nested));
    return Object.freeze(value as object) as T;
}
