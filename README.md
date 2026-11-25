# Employee and Department Manager — TypeScript

The Day 3 employee manager converted to TypeScript. FE04 of my Bloomrix internship.
No framework and no library are used. All names and numbers are sample data, and nothing
is saved when the page is reloaded.

## Files

- index.html, style.css — the page and its styling
- src/types.ts — all shared interfaces, union types and type aliases
- src/immutability.ts — generic deepFreeze
- src/data.ts — 6 departments and 16 sample employees, typed and deeply frozen
- src/pure.ts — pure utility functions with explicit parameter and return types
- src/functional.ts — typed pipe, compose, filterBy, comparing, groupTotals and id generator
- src/operations.ts — typed immutable add, remove and update functions
- src/store.ts — generic Store interface and createStore function
- src/queries.ts — typed filtering, sorting, row building, summaries and checks
- src/demos.ts — typed demo and concept builder functions
- src/ui.ts — typed DOM helpers and render functions
- src/main.ts — typed DOM wiring and event handlers

## TypeScript features used and where

| Feature | Where |
|---|---|
| Interfaces | Employee, Department, Contact, Manager, EmployeeRow and more in types.ts |
| Union types | EmployeeStatus ("Active" \| "On leave" \| "Inactive"), SortKey, MessageKind |
| Optional properties | contact.phone?, manager?, bonus? on the Employee interface |
| Type aliases | Comparator\<T\>, Transform\<T\>, Predicate\<T\> in types.ts |
| Generics | deepFreeze\<T\>, sumBy\<T\>, pick\<T,K\>, pipe\<T\>, createStore\<S\> |
| Explicit return types | Every exported function has an annotated return type |
| Type narrowing | validateNewEmployee checks each field with String() before comparing |
| Type assertions | structuredClone result cast to Employee in demos.ts; DOM elements cast in main.ts |
| keyof | filterBy\<T\>(property: keyof T), pick\<T, K extends keyof T\> |
| Record | SORTERS: Record\<SortKey, Comparator\<Employee\>\>, groupTotals return type |
| Readonly | STATUSES: readonly EmployeeStatus[] prevents accidental mutation |

## Why TypeScript helps in a larger application

**Mistakes caught at compile time, not at runtime.** Passing a string where a number
is expected, or accessing a property that does not exist, becomes a compiler error.
In a larger codebase those mistakes would otherwise appear as runtime bugs that are
hard to trace.

**Interfaces document the data shape.** The Employee and Department interfaces are a
single source of truth. Every function that touches an employee knows exactly which
fields are required and which are optional, without reading the data file.

**Union types make invalid states impossible.** EmployeeStatus can only hold "Active",
"On leave" or "Inactive". Passing any other string is a compile error, so the status
badge renderer never receives an unexpected value.

**Generics remove the need for any.** deepFreeze\<T\>, createStore\<S\> and sumBy\<T\>
work with any type while still letting the compiler track what that type is. The JS
versions either used implicit any or required callers to cast the result.

**IDE support improves across the whole team.** Because every function signature carries
its types, editors can offer accurate autocomplete, inline documentation and instant
feedback on wrong argument types — even for developers who have never read the source.

**Refactoring is safer.** Renaming a property on Employee or changing a function
signature surfaces every call site that needs to change. Without types, those sites
are only found by running the application and hitting the error.

## How to build

```
npm install
npm run build
```

The compiler writes `.js` files to `dist/`. Open index.html with Live Server to run the page.

## How to run without building

Open the folder in Visual Studio Code and use Live Server pointed at index.html.
Browsers do not execute TypeScript directly, so the build step is required first.
