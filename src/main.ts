import { buildConcepts, buildDemos } from "./demos.js";
import { departments, employees as sampleEmployees, STATUSES } from "./data.js";
import { createIdGenerator, pipe } from "./functional.js";
import { deepFreeze } from "./immutability.js";
import { addEmployee, addSkill, buildEmployee, removeEmployee, updateContact, updateEmployee } from "./operations.js";
import { parseSkills, pluralize } from "./pure.js";
import {
    SORT_LABELS,
    closableDepartments,
    findEmployee,
    makeRowBuilder,
    runChecks,
    selectEmployees,
    summarizeDepartments,
    summarizeOverall,
    validateNewEmployee
} from "./queries.js";
import { createStore } from "./store.js";
import {
    fillSelect,
    makeElement,
    renderChecks,
    renderDemos,
    renderEmployeeTable,
    renderSummary,
    requireElement,
    showMessage
} from "./ui.js";
import type { Employee, EmployeeStatus, NewEmployeeInput } from "./types.js";

const el = {
    employeesTitle: requireElement("employees-title"),
    filterForm: requireElement("filter-form") as HTMLFormElement,
    filterDepartment: requireElement("filter-department") as HTMLSelectElement,
    filterStatus: requireElement("filter-status") as HTMLSelectElement,
    filterSort: requireElement("filter-sort") as HTMLSelectElement,
    resultCount: requireElement("result-count"),
    emptyState: requireElement("empty-state") as HTMLElement,
    emptyText: requireElement("empty-text"),
    tableWrap: requireElement("table-wrap") as HTMLElement,
    tableBody: requireElement("table-body"),
    undoButton: requireElement("undo-button") as HTMLButtonElement,
    resetButton: requireElement("reset-button") as HTMLButtonElement,
    message: requireElement("message"),
    addForm: requireElement("add-form") as HTMLFormElement,
    addName: requireElement("add-name") as HTMLInputElement,
    addEmail: requireElement("add-email") as HTMLInputElement,
    addDepartment: requireElement("add-department") as HTMLSelectElement,
    addSalary: requireElement("add-salary") as HTMLInputElement,
    addStatus: requireElement("add-status") as HTMLSelectElement,
    addPhone: requireElement("add-phone") as HTMLInputElement,
    addSkills: requireElement("add-skills") as HTMLInputElement,
    addProblems: requireElement("add-problems"),
    editTitle: requireElement("edit-title"),
    editForm: requireElement("edit-form") as HTMLFormElement,
    editSelect: requireElement("edit-select") as HTMLSelectElement,
    editStatus: requireElement("edit-status") as HTMLSelectElement,
    editSalary: requireElement("edit-salary") as HTMLInputElement,
    editPhone: requireElement("edit-phone") as HTMLInputElement,
    editSkills: requireElement("edit-skills") as HTMLInputElement,
    applyButton: requireElement("apply-button") as HTMLButtonElement,
    summaryBody: requireElement("summary-body"),
    summaryFoot: requireElement("summary-foot"),
    checkList: requireElement("check-list"),
    closableList: requireElement("closable-list"),
    demoContainer: requireElement("demo-container"),
    conceptContainer: requireElement("concept-container")
};

const store = createStore<Employee[]>(sampleEmployees);
const buildRow = makeRowBuilder(departments);
const nextId = createIdGenerator(Math.max(...sampleEmployees.map(({ id }) => id)));
const departmentPairs: [string, string][] = departments.map(({ id, name }) => [id, name]);
const statusPairs: [string, string][] = STATUSES.map((status) => [status, status]);

const readFilters = () => ({
    department: el.filterDepartment.value,
    status: el.filterStatus.value,
    sort: el.filterSort.value
});

function renderList(): void {
    const all = store.getState();
    const shown = selectEmployees(all, readFilters());

    renderEmployeeTable(el.tableBody, shown.map(buildRow));
    el.tableWrap.hidden = shown.length === 0;
    el.emptyState.hidden = shown.length > 0;
    el.emptyText.textContent = all.length === 0 ? "There are no employees." : "No employees match the filters.";
    el.resultCount.textContent = `Showing ${shown.length} of ${pluralize(all.length, "employee")}.`;
}

function fillEditForm(employee: Employee | undefined): void {
    const { status = "Active", salary = "", contact } = employee ?? {};

    el.editStatus.value = status;
    el.editSalary.value = String(salary);
    el.editPhone.value = contact?.phone ?? "";
    el.editSkills.value = "";
    el.applyButton.disabled = employee === undefined;
}

function renderAll(): void {
    const all = store.getState();

    renderList();
    renderSummary(el.summaryBody, el.summaryFoot, summarizeDepartments(all, departments), summarizeOverall(all));
    renderChecks(el.checkList, el.closableList, runChecks(all), closableDepartments(all, departments));
    fillSelect(
        el.editSelect,
        all.map(({ id, name }): [string, string] => [String(id), `${name} (ID ${id})`]),
        el.editSelect.value
    );
    fillEditForm(findEmployee(all, Number(el.editSelect.value)));
    el.undoButton.disabled = !store.canUndo();
    el.undoButton.textContent = `Undo last change (${store.historySize()})`;
}

function commit(next: Employee[], successText: string): void {
    const changed = store.setState(deepFreeze(next));

    showMessage(
        el.message,
        changed ? successText : "Nothing changed, so the same array was kept and the page was not redrawn.",
        changed ? "success" : "info"
    );
}

function handleRemove(id: number): void {
    const current = findEmployee(store.getState(), id);

    if (current === undefined) {
        showMessage(el.message, "That employee could not be found.", "error");
        return;
    }

    commit(removeEmployee(store.getState(), id), `Removed ${current.name}. Use Undo to bring the employee back.`);
    el.employeesTitle.focus();
}

function handleUndo(): void {
    if (!store.undo()) {
        showMessage(el.message, "There is nothing to undo.", "info");
        return;
    }

    showMessage(
        el.message,
        `Undid the last change. ${pluralize(store.historySize(), "change")} can still be undone.`,
        "success"
    );
}

function handleReset(): void {
    const changed = store.setState(sampleEmployees);

    showMessage(
        el.message,
        changed ? "Restored the sample data. Undo brings your changes back." : "The sample data is already showing.",
        changed ? "success" : "info"
    );
}

function handleTableClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");

    if (button === null) {
        return;
    }

    const id = Number(button.dataset.id);

    if (button.dataset.action === "remove") {
        handleRemove(id);
    }

    if (button.dataset.action === "edit") {
        el.editSelect.value = String(id);
        fillEditForm(findEmployee(store.getState(), id));
        el.editTitle.focus();
    }
}

function showProblems(problems: string[]): void {
    el.addProblems.textContent = "";
    el.addProblems.hidden = problems.length === 0;
    problems.forEach((problem) => el.addProblems.append(makeElement("li", "", problem)));
}

function handleAdd(event: Event): void {
    event.preventDefault();

    const values: NewEmployeeInput = {
        name: el.addName.value,
        email: el.addEmail.value,
        department: el.addDepartment.value,
        salary: el.addSalary.value,
        status: el.addStatus.value as EmployeeStatus,
        phone: el.addPhone.value,
        skills: parseSkills(el.addSkills.value)
    };
    const problems = validateNewEmployee(values, store.getState(), departments);

    showProblems(problems);

    if (problems.length > 0) {
        return;
    }

    const employee = buildEmployee(values, nextId());

    commit(addEmployee(store.getState(), employee), `Added ${employee.name} with ID ${employee.id}.`);
    el.addForm.reset();
    el.addStatus.value = "Active";
}

function handleEditSelect(): void {
    fillEditForm(findEmployee(store.getState(), Number(el.editSelect.value)));
}

function handleApply(event: Event): void {
    event.preventDefault();

    const id = Number(el.editSelect.value);
    const current = findEmployee(store.getState(), id);
    const salaryText = el.editSalary.value.trim();
    const salary = Number(salaryText);

    if (current === undefined) {
        showMessage(el.message, "Choose an employee first.", "error");
        return;
    }

    if (salaryText === "" || !(salary > 0)) {
        showMessage(el.message, "The salary must be a number above zero.", "error");
        return;
    }

    const phone = el.editPhone.value.trim();
    const newSkills = parseSkills(el.editSkills.value);
    const steps: Array<(list: Employee[]) => Employee[]> = [
        (list) => updateEmployee(list, id, { status: el.editStatus.value as EmployeeStatus }, { salary }),
        ...(phone === "" ? [] : [(list: Employee[]) => updateContact(list, id, { phone })]),
        ...newSkills.map((skill) => (list: Employee[]) => addSkill(list, id, skill))
    ];

    commit(pipe<Employee[]>(...steps)(store.getState()), `Updated ${current.name}.`);
}

function start(): void {
    fillSelect(el.filterDepartment, [["all", "All departments"], ...departmentPairs]);
    fillSelect(el.filterStatus, [["all", "All statuses"], ...statusPairs]);
    fillSelect(el.filterSort, Object.entries(SORT_LABELS) as [string, string][]);
    fillSelect(el.addDepartment, [["", "-- Choose a department --"], ...departmentPairs]);
    fillSelect(el.addStatus, statusPairs);
    fillSelect(el.editStatus, statusPairs);

    el.filterForm.addEventListener("submit", (event) => event.preventDefault());
    [el.filterDepartment, el.filterStatus, el.filterSort].forEach((select) => {
        select.addEventListener("change", renderList);
    });
    el.tableBody.addEventListener("click", handleTableClick as EventListener);
    el.undoButton.addEventListener("click", handleUndo);
    el.resetButton.addEventListener("click", handleReset);
    el.addForm.addEventListener("submit", handleAdd);
    el.editSelect.addEventListener("change", handleEditSelect);
    el.editForm.addEventListener("submit", handleApply);

    store.subscribe(renderAll);
    renderDemos(el.demoContainer, buildDemos(sampleEmployees));
    renderDemos(el.conceptContainer, buildConcepts(sampleEmployees));
    renderAll();
}

start();
