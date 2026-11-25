import { compose, createIdGenerator, pipe } from "./functional.js";
import { deepFreeze } from "./immutability.js";
import { updateEmployee } from "./operations.js";
import { giveRaise, pick, sumAll } from "./pure.js";
import { findEmployee } from "./queries.js";
import type { DemoSection, Employee } from "./types.js";

function attempt(action: () => void): string {
    try {
        action();
        return "no error";
    } catch (error) {
        return `${(error as Error).name}: ${(error as Error).message}`;
    }
}

function giveRaiseImpure(employee: Employee, percent: number): Employee {
    employee.salary = Math.round(employee.salary * (1 + percent / 100));
    return employee;
}

const hasChanged = <T>(previous: T, next: T): boolean => previous !== next;

function demoAlias(source: Employee[]): DemoSection {
    const original = source.slice(0, 3).map(({ name }) => name);
    const alias = original;
    alias.push("Added through the alias");
    const copy = [...original];
    copy.push("Added to the copy");

    return {
        title: "1. Two names for one array",
        explanation:
            "Assigning an array to another variable does not copy it. Both names point at the same array, so a push through one name changes what the other name sees. Spreading into a new array makes a real copy.",
        lines: [
            `After alias.push(...): original has ${original.length} items, and alias === original is ${alias === original}.`,
            `After copy.push(...) on a spread copy: original still has ${original.length} items and the copy has ${copy.length}.`
        ]
    };
}

function demoSort(source: Employee[]): DemoSection {
    const salaries = source.slice(0, 3).map(({ salary }) => salary);
    const untouched = [...salaries];
    const returned = salaries.sort((first, second) => first - second);
    const sortedCopy = [...untouched].sort((first, second) => first - second);

    return {
        title: "2. sort changes the array it is called on",
        explanation:
            "Most array methods build a new array, but sort, reverse, push, pop and splice change the array itself. Copy first when you need the original order.",
        lines: [
            `salaries.sort(...) changed the array itself: ${salaries.join(", ")}. It returned the same array: ${returned === salaries}.`,
            `[...untouched].sort(...) sorted a copy: ${sortedCopy.join(", ")}. The array untouched is still ${untouched.join(", ")}.`
        ]
    };
}

function demoImpure(source: Employee[]): DemoSection {
    const impureEmployee = structuredClone(findEmployee(source, 2)) as Employee;
    const impureResult = giveRaiseImpure(impureEmployee, 10);
    const pureEmployee = structuredClone(findEmployee(source, 2)) as Employee;
    const pureResult = giveRaise(pureEmployee, 10);

    return {
        title: "3. An impure function changes its caller's data",
        explanation:
            "A function that assigns to the object it receives changes data that belongs to the caller. A pure function returns a new object and leaves the caller's object alone.",
        lines: [
            `giveRaiseImpure changed the object that was passed in: its salary is now ${impureEmployee.salary}, and the returned object is that same object (${impureResult === impureEmployee}).`,
            `giveRaise returned a new object with salary ${pureResult.salary}. The object that was passed in still has ${pureEmployee.salary} (${pureResult === pureEmployee ? "the same object" : "different objects"}).`
        ]
    };
}

function demoShallowCopy(source: Employee[]): DemoSection {
    const original = structuredClone(findEmployee(source, 2)) as Employee;
    const shallow = { ...original };
    shallow.name = "Changed on the copy";
    shallow.contact.email = "changed@example.com";
    shallow.skills.push("typescript");

    const leveled = structuredClone(findEmployee(source, 2)) as Employee;
    const updated = {
        ...leveled,
        contact: { ...leveled.contact, email: "new.address@example.com" },
        skills: [...leveled.skills, "typescript"]
    };

    const base = structuredClone(findEmployee(source, 2)) as Employee;
    const deepCopy = structuredClone(base);
    deepCopy.contact.email = "deep@example.com";

    return {
        title: "4. A shallow copy still shares nested objects",
        explanation:
            "Spread copies only the first level. The name was copied, but contact and skills are objects, so the copy and the original hold the very same nested object. Copy each level you change, or use structuredClone for a full deep copy.",
        lines: [
            `Shallow copy: setting copy.name left original.name as "${original.name}".`,
            `But copy.contact === original.contact is ${shallow.contact === original.contact}, so original.contact.email is now "${original.contact.email}".`,
            `copy.skills.push(...) also changed the original: it now has ${original.skills.length} skills.`,
            `Fix 1, copy each level you change: the original email is still "${leveled.contact.email}" with ${leveled.skills.length} skills, and the updated object has "${updated.contact.email}" with ${updated.skills.length} skills.`,
            `Fix 2, structuredClone: after changing the deep copy, the original email is still "${base.contact.email}" (${deepCopy.contact === base.contact ? "shared" : "not shared"}).`,
            `structuredClone cannot copy functions: ${attempt(() => structuredClone({ run() {} }))}.`
        ]
    };
}

function demoFrozen(source: Employee[]): DemoSection {
    const frozen = deepFreeze(structuredClone(findEmployee(source, 3)) as Employee);

    return {
        title: "5. Freezing turns hidden mutation into an error",
        explanation:
            "A frozen object cannot be changed. This file is a module, and modules run in strict mode, so every attempt throws an error instead of being ignored. The message text comes from your browser.",
        lines: [
            `frozen.name = "Changed": ${attempt(() => { (frozen as { name: string }).name = "Changed"; })}.`,
            `frozen.contact.email = "changed@example.com": ${attempt(() => { (frozen.contact as { email: string }).email = "changed@example.com"; })}.`,
            `frozen.skills.push("extra"): ${attempt(() => { (frozen.skills as string[]).push("extra"); })}.`,
            `Object.isFrozen(frozen) is ${Object.isFrozen(frozen)}, and the nested contact object is frozen too: ${Object.isFrozen(frozen.contact)}.`
        ]
    };
}

function demoChangeDetection(source: Employee[]): DemoSection {
    const mutatedBefore = structuredClone(source.slice(0, 3)) as Employee[];
    const mutatedAfter = mutatedBefore;
    mutatedAfter[0].salary += 1000;

    const before = structuredClone(source.slice(0, 3)) as Employee[];
    const after = updateEmployee(before, 1, { salary: before[0].salary + 1000 });

    return {
        title: "6. Why UI code needs new references",
        explanation:
            "A UI library such as React decides whether to redraw by comparing references: is this the same object as before? A change made in place keeps the reference, so the comparison says nothing changed. An immutable update produces a new reference and unchanged parts are shared.",
        lines: [
            `Changed in place (salary now ${mutatedAfter[0].salary}): has the array reference changed? ${hasChanged(mutatedBefore, mutatedAfter)}.`,
            `Immutable update: has the array reference changed? ${hasChanged(before, after)}.`,
            `In the new array, the changed employee is a new object (${hasChanged(before[0], after[0])}) and the unchanged employee is the same object (${!hasChanged(before[1], after[1])}).`
        ]
    };
}

export function buildDemos(source: Employee[]): DemoSection[] {
    return [
        demoAlias(source),
        demoSort(source),
        demoImpure(source),
        demoShallowCopy(source),
        demoFrozen(source),
        demoChangeDetection(source)
    ];
}

function demoThis(): DemoSection {
    const team = {
        name: "Platform team",
        members: ["Ayesha", "Hamza"],
        describe() {
            return (this as { name?: string })?.name ?? "this is undefined";
        },
        listRegular() {
            const self = this as { name?: string } | undefined;
            return this.members.map(function (member) {
                return `${member} (${self?.name ?? "this is undefined"})`;
            });
        },
        listArrow() {
            return this.members.map((member) => `${member} (${this.name})`);
        }
    };
    const detached = team.describe;
    const bound = team.describe.bind(team);

    return {
        title: "this in different places",
        explanation:
            "A regular function gets its this from how it is called. An arrow function keeps the this of the code around it. bind fixes this ahead of time.",
        lines: [
            `team.describe(): ${team.describe()}.`,
            `const detached = team.describe; detached(): ${detached()}.`,
            `team.listRegular(), a regular function as the callback: ${team.listRegular().join(", ")}.`,
            `team.listArrow(), an arrow function as the callback: ${team.listArrow().join(", ")}.`,
            `team.describe.bind(team)(): ${bound()}.`
        ]
    };
}

function demoReferences(): DemoSection {
    const values = ["10", "20", "30"];

    return {
        title: "Function references and the arguments callbacks receive",
        explanation:
            "map calls its callback with three arguments: the value, the index and the array. A function that accepts more parameters than you expect can read them by mistake.",
        lines: [
            `["10", "20", "30"].map(parseInt) gives [${values.map(parseInt).join(", ")}], because parseInt reads the index as its radix.`,
            `["10", "20", "30"].map(Number) gives [${values.map(Number).join(", ")}].`,
            `["10", "20", "30"].map((value) => parseInt(value, 10)) gives [${values.map((value) => parseInt(value, 10)).join(", ")}].`
        ]
    };
}

function demoShortCircuit(source: Employee[]): DemoSection {
    const ayesha = findEmployee(source, 1) as Employee;
    const hamza = findEmployee(source, 2) as Employee;
    const sara = findEmployee(source, 3) as Employee;
    const zainab = findEmployee(source, 6) as Employee;

    return {
        title: "Short-circuit evaluation, || and ??",
        explanation:
            "|| replaces every falsy value, including 0 and an empty string. ?? replaces only null and undefined. && returns the first falsy value, or the last value when none is falsy.",
        lines: [
            `Zainab's bonus is ${zainab.bonus}. bonus || "None set" gives "${zainab.bonus || "None set"}", which hides a real 0. bonus ?? "None set" gives "${zainab.bonus ?? "None set"}".`,
            `Sara has no bonus property. bonus ?? "None set" gives "${sara.bonus ?? "None set"}".`,
            `hamza.manager && hamza.manager.name gives "${hamza.manager && hamza.manager.name}". ayesha.manager && ayesha.manager.name gives ${String(ayesha.manager && ayesha.manager.name)}.`,
            `sara.contact?.phone ?? "Not provided" gives "${sara.contact?.phone ?? "Not provided"}", and ayesha.manager?.name ?? "No manager" gives "${ayesha.manager?.name ?? "No manager"}".`
        ]
    };
}

function demoDestructuring(source: Employee[]): DemoSection {
    const [first, second, ...others] = source.map(({ name }) => name);
    const { id, name, ...rest } = findEmployee(source, 1) as Employee;

    return {
        title: "Destructuring, rest and spread",
        explanation:
            "Array destructuring takes items by position. Object destructuring takes properties by name. The rest pattern collects whatever is left. A rest parameter collects extra arguments.",
        lines: [
            `const [first, second, ...others] = names gives "${first}", "${second}" and ${others.length} more names.`,
            `const { id, name, ...rest } = employee gives id ${id}, name "${name}", and rest has the keys: ${Object.keys(rest).join(", ")}.`,
            `sumAll(1000, 2000, 3000) gives ${sumAll(1000, 2000, 3000)}.`,
            `pick(employee, "name", "salary") gives ${JSON.stringify(pick(findEmployee(source, 1) as Employee, "name", "salary"))}.`
        ]
    };
}

function demoComposition(): DemoSection {
    const addOne = (number: number): number => number + 1;
    const double = (number: number): number => number * 2;
    const nextA = createIdGenerator(100);
    const nextB = createIdGenerator(0);

    return {
        title: "Composition and closures",
        explanation:
            "pipe runs functions from left to right and compose runs them from right to left. A closure remembers the variables it was created with, so each id generator keeps its own counter.",
        lines: [
            `pipe(addOne, double)(5) gives ${pipe<number>(addOne, double)(5)}, and compose(addOne, double)(5) gives ${compose<number>(addOne, double)(5)}.`,
            `Two id generators: ${[nextA(), nextA(), nextB(), nextA()].join(", ")} (the first started at 100 and the second at 0).`
        ]
    };
}

export function buildConcepts(source: Employee[]): DemoSection[] {
    return [
        demoThis(),
        demoReferences(),
        demoShortCircuit(source),
        demoDestructuring(source),
        demoComposition()
    ];
}
