export type EmployeeStatus = "Active" | "On leave" | "Inactive";

export type SortKey = "name" | "salary-high" | "salary-low" | "department";

export interface Contact {
    email: string;
    phone?: string;
}

export interface Manager {
    name: string;
}

export interface Employee {
    id: number;
    name: string;
    department: string;
    status: EmployeeStatus;
    salary: number;
    skills: string[];
    contact: Contact;
    manager?: Manager;
    bonus?: number;
}

export interface Department {
    id: string;
    name: string;
}

export interface EmployeeRow {
    id: number;
    name: string;
    department: string;
    status: EmployeeStatus;
    salary: string;
    manager: string;
    phone: string;
    bonus: string;
    skills: string;
}

export interface DepartmentSummary {
    id: string;
    name: string;
    count: number;
    total: number;
    average: number;
    share: number;
}

export interface OverallSummary {
    count: number;
    total: number;
    average: number;
    active: number;
}

export interface Check {
    method: "every" | "some";
    statement: string;
    result: boolean;
}

export interface ClosableDepartment {
    id: string;
    name: string;
    count: number;
    canClose: boolean;
}

export interface DemoSection {
    title: string;
    explanation: string;
    lines: string[];
}

export interface Filters {
    department: string;
    status: string;
    sort: string;
}

export interface NewEmployeeInput {
    name: string;
    email: string;
    department: string;
    salary: string | number;
    status?: EmployeeStatus;
    phone?: string;
    skills?: string[];
}

export type Comparator<T> = (a: T, b: T) => number;

export type Transform<T> = (item: T) => T;

export type Predicate<T> = (item: T) => boolean;
