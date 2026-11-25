import type { Comparator } from "./types.js";

export function pipe<T>(...steps: Array<(value: T) => T>): (input: T) => T {
    return (input: T) => steps.reduce((result, step) => step(result), input);
}

export function compose<T>(...steps: Array<(value: T) => T>): (input: T) => T {
    return pipe(...([...steps].reverse() as Array<(value: T) => T>));
}

export function createIdGenerator(lastUsedId: number = 0): () => number {
    let current = lastUsedId;

    return () => {
        current += 1;
        return current;
    };
}

export function filterBy<T, K extends keyof T>(property: K): (value: T[K] | "all") => (list: T[]) => T[] {
    return (value) => (list) =>
        value === "all" ? list : list.filter((item) => item[property] === value);
}

export function comparing<T>(getValue: (item: T) => string | number): Comparator<T> {
    return (first, second) => {
        const firstValue = getValue(first);
        const secondValue = getValue(second);

        return typeof firstValue === "string"
            ? firstValue.localeCompare(secondValue as string)
            : (firstValue as number) - (secondValue as number);
    };
}

export function descending<T>(compare: Comparator<T>): Comparator<T> {
    return (first, second) => compare(second, first);
}

export function sortWith<T>(compare: Comparator<T>): (list: T[]) => T[] {
    return (list) => [...list].sort(compare);
}

export function groupTotals<T>(
    getKey: (item: T) => string,
    getValue: (item: T) => number
): (list: T[]) => Record<string, { count: number; total: number }> {
    return (list) =>
        list.reduce<Record<string, { count: number; total: number }>>((totals, item) => {
            const key = getKey(item);
            const current = totals[key] ?? { count: 0, total: 0 };

            return { ...totals, [key]: { count: current.count + 1, total: current.total + getValue(item) } };
        }, {});
}
