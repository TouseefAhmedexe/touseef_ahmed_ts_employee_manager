import { comparing, descending, filterBy, groupTotals, pipe, sortWith } from "./functional.js";
import { formatSalary, percentage, sumBy } from "./pure.js";
import type {
    Check,
    ClosableDepartment,
    Comparator,
    Department,
    DepartmentSummary,
    Employee,
    EmployeeRow,
    Filters,
    NewEmployeeInput,
    OverallSummary,
    SortKey
} from "./types.js";

export const isActive = ({ status }: Employee): boolean => status === "Active";

export const isInactive = ({ status }: Employee): boolean => status === "Inactive";

export const SORTERS: Record<SortKey, Comparator<Employee>> = Object.freeze({
    name: comparing(({ name }) => name),
    "salary-high": descending(comparing(({ salary }) => salary)),
    "salary-low": comparing(({ salary }) => salary),
    department: comparing(({ department }) => department)
});

export const SORT_LABELS: Record<SortKey, string> = Object.freeze({
    name: "Name (A to Z)",
    "salary-high": "Salary (highest first)",
    "salary-low": "Salary (lowest first)",
    department: "Department (A to Z)"
});

export function findEmployee(employees: Employee[], id: number): Employee | undefined {
    return employees.find((employee) => employee.id === id);
}

export function selectEmployees(employees: Employee[], { department, status, sort }: Filters): Employee[] {
    return pipe<Employee[]>(
        filterBy<Employee>("department")(department as Employee["department"]),
        filterBy<Employee>("status")(status as Employee["status"]),
        sortWith(SORTERS[sort as SortKey] ?? SORTERS.name)
    )(employees);
}

export function makeRowBuilder(departments: Department[]): (employee: Employee) => EmployeeRow {
    const names = departments.reduce<Record<string, string>>(
        (all, { id, name }) => ({ ...all, [id]: name }),
        {}
    );

    return (employee: Employee): EmployeeRow => {
        const { id, name, department, status, salary, skills = [], contact, manager, bonus } = employee;

        return {
            id,
            name,
            department: names[department] ?? "Unknown department",
            status,
            salary: formatSalary(salary),
            manager: manager?.name ?? "No manager",
            phone: contact?.phone ?? "Not provided",
            bonus: bonus === undefined ? "None set" : formatSalary(bonus),
            skills: skills.join(", ") || "No skills listed"
        };
    };
}

const totalsByDepartment = groupTotals<Employee>(
    ({ department }) => department,
    ({ salary }) => salary
);

export function summarizeDepartments(employees: Employee[], departments: Department[]): DepartmentSummary[] {
    const totals = totalsByDepartment(employees);
    const overall = sumBy(employees, ({ salary }) => salary);

    return departments.map(({ id, name }) => {
        const { count, total } = totals[id] ?? { count: 0, total: 0 };

        return {
            id,
            name,
            count,
            total,
            average: count === 0 ? 0 : Math.round(total / count),
            share: percentage(total, overall)
        };
    });
}

export function summarizeOverall(employees: Employee[]): OverallSummary {
    const total = sumBy(employees, ({ salary }) => salary);

    return {
        count: employees.length,
        total,
        average: employees.length === 0 ? 0 : Math.round(total / employees.length),
        active: employees.filter(isActive).length
    };
}

export function runChecks(employees: Employee[]): Check[] {
    return [
        {
            method: "every",
            statement: "Every employee has an email address",
            result: employees.every(({ contact }) => Boolean(contact?.email))
        },
        {
            method: "every",
            statement: "Every salary is above zero",
            result: employees.every(({ salary }) => salary > 0)
        },
        {
            method: "every",
            statement: "Every employee has at least one skill",
            result: employees.every(({ skills = [] }) => skills.length > 0)
        },
        {
            method: "every",
            statement: "Every active employee has a manager",
            result: employees.filter(isActive).every(({ manager }) => manager !== undefined)
        },
        {
            method: "some",
            statement: "Some employee is on leave",
            result: employees.some(({ status }) => status === "On leave")
        },
        {
            method: "some",
            statement: "Some employee has no phone number",
            result: employees.some(({ contact }) => !contact?.phone)
        }
    ];
}

export function closableDepartments(employees: Employee[], departments: Department[]): ClosableDepartment[] {
    return departments.map(({ id, name }) => {
        const members = employees.filter(({ department }) => department === id);

        return { id, name, count: members.length, canClose: members.every(isInactive) };
    });
}

const REQUIRED_FIELDS: Array<keyof NewEmployeeInput> = ["name", "email", "department", "salary"];

export function validateNewEmployee(
    input: NewEmployeeInput,
    employees: Employee[],
    departments: Department[]
): string[] {
    const problems: string[] = [];
    const email = String(input.email ?? "").trim().toLowerCase();
    const salaryText = String(input.salary ?? "").trim();

    if (!REQUIRED_FIELDS.every((field) => String(input[field] ?? "").trim() !== "")) {
        problems.push("Name, email, department and salary are all required.");
    }

    if (email !== "" && !email.includes("@")) {
        problems.push("The email address must contain an @ sign.");
    }

    if (email !== "" && employees.some(({ contact }) => contact?.email?.toLowerCase() === email)) {
        problems.push("Another employee already uses this email address.");
    }

    if (input.department !== "" && !departments.some(({ id }) => id === input.department)) {
        problems.push("Choose a department from the list.");
    }

    if (salaryText !== "" && !(Number(salaryText) > 0)) {
        problems.push("The salary must be a number above zero.");
    }

    return problems;
}
