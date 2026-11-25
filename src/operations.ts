import type { Employee, NewEmployeeInput, Transform } from "./types.js";

export function addEmployee(employees: Employee[], employee: Employee): Employee[] {
    return [...employees, employee];
}

export function removeEmployee(employees: Employee[], id: number): Employee[] {
    return employees.some((employee) => employee.id === id)
        ? employees.filter((employee) => employee.id !== id)
        : employees;
}

export function updateEmployeeWith(employees: Employee[], id: number, transform: Transform<Employee>): Employee[] {
    const current = employees.find((employee) => employee.id === id);

    if (current === undefined) {
        return employees;
    }

    const updated = transform(current);

    if (updated === current) {
        return employees;
    }

    return employees.map((employee) => (employee === current ? updated : employee));
}

const differs = (target: Employee, changes: Partial<Employee>): boolean =>
    (Object.entries(changes) as Array<[keyof Employee, unknown]>).some(([key, value]) => target[key] !== value);

export function updateEmployee(employees: Employee[], id: number, ...changeSets: Partial<Employee>[]): Employee[] {
    const changes = changeSets.reduce<Partial<Employee>>((all, changeSet) => ({ ...all, ...changeSet }), {});

    return updateEmployeeWith(employees, id, (employee) =>
        differs(employee, changes) ? { ...employee, ...changes } : employee
    );
}

export function updateContact(
    employees: Employee[],
    id: number,
    contactChanges: Partial<{ email: string; phone: string }>
): Employee[] {
    return updateEmployeeWith(employees, id, (employee) => {
        const contact = employee.contact ?? { email: "" };
        const hasChange = (Object.entries(contactChanges) as Array<[string, string]>).some(
            ([key, value]) => contact[key as keyof typeof contact] !== value
        );

        return hasChange ? { ...employee, contact: { ...contact, ...contactChanges } } : employee;
    });
}

export function addSkill(employees: Employee[], id: number, skill: string): Employee[] {
    return updateEmployeeWith(employees, id, (employee) => {
        const skills = employee.skills ?? [];

        return skills.includes(skill) ? employee : { ...employee, skills: [...skills, skill] };
    });
}

export function buildEmployee(input: NewEmployeeInput, id: number): Employee {
    const { name, email, department, salary, status = "Active", phone = "", skills = [] } = input;
    const trimmedPhone = (phone as string).trim();
    const contact = {
        email: (email as string).trim(),
        ...(trimmedPhone === "" ? {} : { phone: trimmedPhone })
    };

    return {
        id,
        name: (name as string).trim(),
        department: department as string,
        status,
        salary: Number(salary),
        skills: [...skills],
        contact
    };
}
