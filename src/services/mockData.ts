import type { ProjectType } from "../types/projectAnalysis";

export interface MockProjectScenario {
  id: string;
  title: string;
  projectType: ProjectType;
  summary: string;
  idea: string;
}

export const MOCK_PROJECT_SCENARIOS: MockProjectScenario[] = [
  {
    id: "education-operations",
    title: "Sports Education Operations",
    projectType: "Education Platform",
    summary:
      "A structured education workflow with onboarding, attendance, coach assignment, parent communication, and exception review.",
    idea:
      "A web platform for sports schools to manage student registration, coach assignment, attendance, progress follow-up, parent communication, and an admin review workflow for exceptional cases. The system should support students, parents, coaches, and administrators with dashboards, notifications, reports, and approval steps for transfers, schedule changes, and missed-payment exceptions.",
  },
  {
    id: "saas-onboarding",
    title: "B2B SaaS Workspace",
    projectType: "SaaS",
    summary:
      "A subscription-driven SaaS product with tenant onboarding, plan management, permissions, and operational reporting.",
    idea:
      "A SaaS workspace for small legal teams to manage client matters, task assignment, document requests, internal approvals, and subscription plans. The product should support workspace owners, case managers, and staff members with role-based permissions, onboarding, plan upgrades, billing visibility, activity history, and dashboards that show workload, turnaround time, and overdue items.",
  },
  {
    id: "booking-clinic",
    title: "Specialist Booking Platform",
    projectType: "Booking Platform",
    summary:
      "A multi-role booking journey with availability, reminders, cancellation rules, and manual intervention paths.",
    idea:
      "A booking platform for physiotherapy clinics that lets patients search specialists, book appointments, reschedule visits, receive reminders, upload pre-visit notes, and track visit history. Clinic staff should manage schedules, doctor availability, cancellations, no-show follow-up, waitlists, and exception approvals when appointments need manual confirmation or refund review.",
  },
  {
    id: "commerce-equipment",
    title: "Equipment E-commerce",
    projectType: "E-commerce",
    summary:
      "An e-commerce flow with product discovery, stock-aware checkout, payment, orders, and after-sales support.",
    idea:
      "An e-commerce platform for school and training equipment where buyers can browse categorized products, compare options, manage a cart, complete payment, and track delivery. Operations staff should manage inventory, order review, shipment updates, returns, discount rules, and exception handling for out-of-stock items, payment failures, and refund approvals.",
  },
  {
    id: "crm-pipeline",
    title: "Sales CRM Pipeline",
    projectType: "CRM",
    summary:
      "A CRM workflow focused on leads, qualification, follow-up, and manager oversight.",
    idea:
      "A CRM system for B2B agencies to capture inbound leads, assign sales owners, manage deal stages, schedule follow-up actions, log calls and notes, and produce pipeline reports. Sales managers need dashboards, approval checkpoints for discounts, lost-deal analysis, and alerts when leads are stale or opportunities are blocked.",
  },
];

export function getMockProjectScenario(
  scenarioId: string,
): MockProjectScenario | undefined {
  return MOCK_PROJECT_SCENARIOS.find((scenario) => scenario.id === scenarioId);
}

export function getDefaultMockProjectScenario(): MockProjectScenario {
  return MOCK_PROJECT_SCENARIOS[0];
}
