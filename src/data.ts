import { deepFreeze } from "./immutability.js";
import type { Department, Employee, EmployeeStatus } from "./types.js";

export const departments: Department[] = deepFreeze([
    { id: "engineering", name: "Engineering" },
    { id: "design", name: "Design" },
    { id: "marketing", name: "Marketing" },
    { id: "finance", name: "Finance" },
    { id: "hr", name: "Human Resources" },
    { id: "legal", name: "Legal" }
]);

export const STATUSES: readonly EmployeeStatus[] = Object.freeze(["Active", "On leave", "Inactive"]);

export const employees: Employee[] = deepFreeze([
    {
        id: 1,
        name: "Ayesha Khan",
        department: "engineering",
        status: "Active",
        salary: 120000,
        skills: ["leadership", "architecture"],
        contact: { email: "ayesha.khan@example.com", phone: "0300-1234501" },
        bonus: 5000
    },
    {
        id: 2,
        name: "Hamza Ali",
        department: "engineering",
        status: "Active",
        salary: 95000,
        skills: ["javascript", "react"],
        contact: { email: "hamza.ali@example.com", phone: "0300-1234502" },
        manager: { name: "Ayesha Khan" },
        bonus: 3000
    },
    {
        id: 3,
        name: "Sara Ahmed",
        department: "engineering",
        status: "Active",
        salary: 78000,
        skills: ["css", "html"],
        contact: { email: "sara.ahmed@example.com" },
        manager: { name: "Ayesha Khan" }
    },
    {
        id: 4,
        name: "Bilal Hussain",
        department: "engineering",
        status: "On leave",
        salary: 64000,
        skills: ["testing"],
        contact: { email: "bilal.hussain@example.com", phone: "0300-1234504" },
        manager: { name: "Hamza Ali" }
    },
    {
        id: 5,
        name: "Maryam Noor",
        department: "design",
        status: "Active",
        salary: 88000,
        skills: ["figma", "research"],
        contact: { email: "maryam.noor@example.com", phone: "0300-1234505" },
        bonus: 4000
    },
    {
        id: 6,
        name: "Zainab Malik",
        department: "design",
        status: "Active",
        salary: 62000,
        skills: ["illustration"],
        contact: { email: "zainab.malik@example.com" },
        manager: { name: "Maryam Noor" },
        bonus: 0
    },
    {
        id: 7,
        name: "Usman Tariq",
        department: "hr",
        status: "Active",
        salary: 82000,
        skills: ["recruiting", "policy"],
        contact: { email: "usman.tariq@example.com", phone: "0300-1234507" },
        bonus: 2500
    },
    {
        id: 8,
        name: "Fatima Siddiqui",
        department: "hr",
        status: "Inactive",
        salary: 52000,
        skills: ["recruiting"],
        contact: { email: "fatima.siddiqui@example.com" },
        manager: { name: "Usman Tariq" }
    },
    {
        id: 9,
        name: "Hassan Raza",
        department: "finance",
        status: "Active",
        salary: 70000,
        skills: ["accounting"],
        contact: { email: "hassan.raza@example.com", phone: "0300-1234509" },
        bonus: 1500
    },
    {
        id: 10,
        name: "Ali Hamid",
        department: "finance",
        status: "Active",
        salary: 74000,
        skills: ["analysis", "excel"],
        contact: { email: "ali.hamid@example.com", phone: "0300-1234510" },
        manager: { name: "Hassan Raza" }
    },
    {
        id: 11,
        name: "Noor Fatima",
        department: "marketing",
        status: "Active",
        salary: 58000,
        skills: ["content", "seo"],
        contact: { email: "noor.fatima@example.com" },
        manager: { name: "Omar Sheikh" }
    },
    {
        id: 12,
        name: "Omar Sheikh",
        department: "marketing",
        status: "Active",
        salary: 92000,
        skills: ["strategy", "analytics"],
        contact: { email: "omar.sheikh@example.com", phone: "0300-1234512" },
        bonus: 3500
    },
    {
        id: 13,
        name: "Imran Qureshi",
        department: "marketing",
        status: "On leave",
        salary: 61000,
        skills: ["social media"],
        contact: { email: "imran.qureshi@example.com", phone: "0300-1234513" },
        manager: { name: "Omar Sheikh" }
    },
    {
        id: 14,
        name: "Hina Aslam",
        department: "design",
        status: "Inactive",
        salary: 59000,
        skills: ["branding"],
        contact: { email: "hina.aslam@example.com", phone: "0300-1234514" },
        manager: { name: "Maryam Noor" }
    },
    {
        id: 15,
        name: "Kamran Javed",
        department: "finance",
        status: "On leave",
        salary: 66000,
        skills: ["payroll"],
        contact: { email: "kamran.javed@example.com" },
        manager: { name: "Hassan Raza" }
    },
    {
        id: 16,
        name: "Rabia Anwar",
        department: "engineering",
        status: "Active",
        salary: 81000,
        skills: ["node", "databases"],
        contact: { email: "rabia.anwar@example.com", phone: "0300-1234516" },
        manager: { name: "Ayesha Khan" },
        bonus: 2000
    }
]);
