import type { Employee } from "./types.js";

export function formatSalary(amount: number): string {
    return `$${amount.toLocaleString("en-US")}`;
}

export function sumBy<T>(items: T[], getValue: (item: T) => number): number {
    return items.reduce((total, item) => total + getValue(item), 0);
}

export function percentage(part: number, whole: number): number {
    return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

export function pluralize(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function parseSkills(text: string): string[] {
    return text
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter((skill) => skill !== "");
}

export function sumAll(...numbers: number[]): number {
    return numbers.reduce((total, number) => total + number, 0);
}

export function pick<T extends object, K extends keyof T>(source: T, ...keys: K[]): Pick<T, K> {
    return keys.reduce(
        (result, key) => (key in source ? { ...result, [key]: source[key] } : result),
        {} as Pick<T, K>
    );
}

export function giveRaise(employee: Employee, percent: number): Employee {
    return { ...employee, salary: Math.round(employee.salary * (1 + percent / 100)) };
}
