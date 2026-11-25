import { formatSalary, pluralize } from "./pure.js";
import type { Check, ClosableDepartment, DemoSection, DepartmentSummary, EmployeeRow, EmployeeStatus, OverallSummary } from "./types.js";

type MessageKind = "success" | "error" | "info";

const STATUS_KINDS: Record<EmployeeStatus, string> = {
    Active: "active",
    "On leave": "leave",
    Inactive: "inactive"
};

export function requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);

    if (element === null) {
        throw new Error(`The element #${id} is missing from the page.`);
    }

    return element;
}

export function makeElement(tag: string, className: string = "", text: string = ""): HTMLElement {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;
    return element;
}

export function fillSelect(select: HTMLSelectElement, pairs: [string, string][], selectedValue?: string): void {
    select.textContent = "";
    pairs.forEach(([value, label]) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = label;
        select.append(option);
    });

    if (selectedValue !== undefined && pairs.some(([value]) => value === selectedValue)) {
        select.value = selectedValue;
    }
}

export function showMessage(element: HTMLElement, text: string, kind: MessageKind): void {
    element.textContent = text;
    element.className = `message message--${kind}`;
}

function makeActionButton(label: string, action: string, id: number, name: string): HTMLButtonElement {
    const button = makeElement("button", `btn btn--small ${action === "remove" ? "btn--danger" : "btn--secondary"}`, label) as HTMLButtonElement;

    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = String(id);
    button.setAttribute("aria-label", `${label} ${name}`);
    return button;
}

export function renderEmployeeTable(body: HTMLElement, rows: EmployeeRow[]): void {
    body.textContent = "";
    rows.forEach((row) => {
        const { id, name, status } = row;
        const tableRow = makeElement("tr");
        const actions = makeElement("td", "actions");
        const statusCell = makeElement("td");

        statusCell.append(makeElement("span", `badge badge--${STATUS_KINDS[status]}`, status));
        actions.append(makeActionButton("Edit", "edit", id, name), makeActionButton("Remove", "remove", id, name));
        tableRow.append(
            makeElement("td", "num", String(id)),
            makeElement("td", "strong", name),
            makeElement("td", "", row.department),
            statusCell,
            makeElement("td", "num", row.salary),
            makeElement("td", "", row.manager),
            makeElement("td", "", row.phone),
            makeElement("td", "num", row.bonus),
            makeElement("td", "", row.skills),
            actions
        );
        body.append(tableRow);
    });
}

export function renderSummary(
    body: HTMLElement,
    foot: HTMLElement,
    rows: DepartmentSummary[],
    overall: OverallSummary
): void {
    body.textContent = "";
    rows.forEach(({ name, count, total, average, share }) => {
        const row = makeElement("tr");

        row.append(
            makeElement("td", "", name),
            makeElement("td", "num", String(count)),
            makeElement("td", "num", formatSalary(total)),
            makeElement("td", "num", formatSalary(average)),
            makeElement("td", "num", `${share}%`)
        );
        body.append(row);
    });

    const label = makeElement("th", "", `All departments (${overall.active} active)`) as HTMLTableCellElement;
    const totalRow = makeElement("tr");

    label.scope = "row";
    foot.textContent = "";
    totalRow.append(
        label,
        makeElement("td", "num", String(overall.count)),
        makeElement("td", "num", formatSalary(overall.total)),
        makeElement("td", "num", formatSalary(overall.average)),
        makeElement("td", "num", overall.total === 0 ? "0%" : "100%")
    );
    foot.append(totalRow);
}

function makeYesNo(result: boolean): HTMLElement {
    return makeElement("span", `badge badge--${result ? "yes" : "no"}`, result ? "Yes" : "No");
}

export function renderChecks(
    checkList: HTMLElement,
    closableList: HTMLElement,
    checks: Check[],
    closable: ClosableDepartment[]
): void {
    checkList.textContent = "";
    checks.forEach(({ method, statement, result }) => {
        const item = makeElement("li");

        item.append(makeElement("code", "", method), statement, makeYesNo(result));
        checkList.append(item);
    });

    closableList.textContent = "";
    closable.forEach(({ name, count, canClose }) => {
        const item = makeElement("li");
        const note = count === 0 && canClose
            ? `${name}: no employees, so "every employee is inactive" is true by definition`
            : `${name}: ${pluralize(count, "employee")}`;

        item.append(note, makeYesNo(canClose));
        closableList.append(item);
    });
}

export function renderDemos(container: HTMLElement, demos: DemoSection[]): void {
    container.textContent = "";
    demos.forEach(({ title, explanation, lines }) => {
        const article = makeElement("article", "demo");
        const list = makeElement("ul", "demo__lines");

        lines.forEach((line) => list.append(makeElement("li", "", line)));
        article.append(makeElement("h3", "", title), makeElement("p", "", explanation), list);
        container.append(article);
    });
}
