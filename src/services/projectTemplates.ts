import type { ProjectType } from "../types/projectAnalysis";

export interface FlowTemplateHint {
  name: string;
  description: string;
  relatedTheme: string;
}

export interface ScreenTemplateHint {
  name: string;
  purpose: string;
}

export interface ProjectTemplate {
  projectType: ProjectType;
  domain: string;
  systemType: string;
  triggers: string[];
  defaultRoles: string[];
  entities: string[];
  mustHaveFeatures: string[];
  shouldHaveFeatures: string[];
  couldHaveFeatures: string[];
  wontHaveNow: string[];
  extraFlows: FlowTemplateHint[];
  screenHints: ScreenTemplateHint[];
  metrics: string[];
  clarificationQuestions: string[];
}

export const PROJECT_TYPE_TEMPLATES: ProjectTemplate[] = [
  {
    projectType: "E-commerce",
    domain: "Digital Commerce",
    systemType: "E-commerce storefront and order management platform",
    triggers: ["shop", "store", "product", "cart", "checkout", "order", "inventory", "catalog", "متجر", "منتج", "سلة", "طلب"],
    defaultRoles: ["Guest", "Customer", "Catalog Manager", "Administrator"],
    entities: ["Product", "Cart", "Order", "Payment attempt", "Inventory item"],
    mustHaveFeatures: [
      "browse searchable products and categories",
      "manage a cart and checkout process",
      "track order creation, payment state, and fulfillment status",
      "manage products, inventory, and pricing from an admin workspace",
    ],
    shouldHaveFeatures: [
      "support order cancellation or refund requests",
      "send order confirmations and status notifications",
    ],
    couldHaveFeatures: ["support promotions, coupon codes, or product recommendations"],
    wontHaveNow: ["advanced loyalty programs and multi-vendor settlement"],
    extraFlows: [
      { name: "Cart Flow", description: "Add, update, and review cart contents before checkout.", relatedTheme: "cart" },
      { name: "Checkout / Payment Flow", description: "Submit order, validate payment, and confirm purchase.", relatedTheme: "payment" },
      { name: "Order Management Flow", description: "Track order processing, fulfillment, and cancellation.", relatedTheme: "order" },
    ],
    screenHints: [
      { name: "Product Catalog", purpose: "Help shoppers discover and compare products." },
      { name: "Cart", purpose: "Review selected items and prepare for checkout." },
      { name: "Checkout", purpose: "Capture delivery and payment details securely." },
    ],
    metrics: ["Cart conversion rate", "Checkout completion rate", "Order fulfillment time", "Inventory accuracy"],
    clarificationQuestions: [
      "Will the first release handle online payments or only order requests?",
      "How should stock availability affect checkout behavior?",
    ],
  },
  {
    projectType: "Booking Platform",
    domain: "Scheduling and Reservations",
    systemType: "Booking and appointment coordination platform",
    triggers: ["booking", "reservation", "appointment", "schedule", "calendar", "slot", "حجز", "موعد", "تقويم"],
    defaultRoles: ["Guest", "Customer", "Service Provider", "Administrator"],
    entities: ["Booking", "Timeslot", "Availability calendar", "Cancellation request", "Reminder"],
    mustHaveFeatures: [
      "search available times and create bookings",
      "manage provider availability and schedule changes",
      "confirm, reschedule, and cancel bookings with status visibility",
      "send reminders and follow-up notifications",
    ],
    shouldHaveFeatures: [
      "support waitlists or alternative timeslot suggestions",
      "record booking notes or special instructions",
    ],
    couldHaveFeatures: ["support recurring bookings or package reservations"],
    wontHaveNow: ["complex resource optimization and predictive scheduling"],
    extraFlows: [
      { name: "Booking Flow", description: "Choose availability, confirm details, and secure the slot.", relatedTheme: "booking" },
      { name: "Cancellation / Reschedule Flow", description: "Cancel or move an appointment and notify affected users.", relatedTheme: "cancellation" },
      { name: "Reminder Flow", description: "Trigger reminders before the appointment and capture follow-up status.", relatedTheme: "reminder" },
    ],
    screenHints: [
      { name: "Availability Search", purpose: "Find open time slots and compare options." },
      { name: "Booking Details", purpose: "Review appointment details and next steps." },
      { name: "Provider Schedule", purpose: "Manage availability and booking load." },
    ],
    metrics: ["Booking completion rate", "No-show rate", "Reschedule rate", "Average confirmation time"],
    clarificationQuestions: [
      "Does the platform need real-time availability updates in the first release?",
      "How should cancellations and reminders be communicated?",
    ],
  },
  {
    projectType: "SaaS",
    domain: "Software Service Operations",
    systemType: "Subscription-based SaaS workspace",
    triggers: ["saas", "subscription", "plan", "workspace", "tenant", "license", "اشتراك", "خطة", "مساحة"],
    defaultRoles: ["Guest", "Workspace Member", "Workspace Admin", "Platform Administrator"],
    entities: ["Workspace", "Plan", "Member", "Permission set", "Subscription"],
    mustHaveFeatures: [
      "create workspaces and invite members",
      "manage plans, subscriptions, and permission levels",
      "provide dashboards and role-based access to core features",
      "track member activity and subscription state",
    ],
    shouldHaveFeatures: ["support billing lifecycle messaging", "allow plan upgrades and downgrades"],
    couldHaveFeatures: ["usage-based limits or in-app onboarding tours"],
    wontHaveNow: ["complex billing reconciliation across multiple entities"],
    extraFlows: [
      { name: "Subscription Flow", description: "Select a plan, activate the workspace, and manage subscription state.", relatedTheme: "subscription" },
      { name: "Member & Permissions Flow", description: "Invite users, assign roles, and control access.", relatedTheme: "permission" },
    ],
    screenHints: [
      { name: "Plan Selection", purpose: "Choose and compare subscription packages." },
      { name: "Workspace Members", purpose: "Manage users, roles, and invitations." },
    ],
    metrics: ["Workspace activation rate", "Seat utilization", "Plan upgrade rate", "Admin setup completion time"],
    clarificationQuestions: [
      "Should billing actions be real in the first release or mocked for workflow design only?",
      "How granular do workspace permissions need to be?",
    ],
  },
  {
    projectType: "Marketplace",
    domain: "Two-Sided Commerce",
    systemType: "Marketplace and partner coordination platform",
    triggers: ["marketplace", "vendor", "seller", "buyer", "merchant", "partner", "سوق", "بائع", "مشتري", "شريك"],
    defaultRoles: ["Guest", "Buyer", "Seller / Partner", "Marketplace Operator", "Administrator"],
    entities: ["Listing", "Partner profile", "Buyer request", "Offer", "Order"],
    mustHaveFeatures: [
      "manage partner onboarding and listing creation",
      "match buyers with relevant listings or offers",
      "track order or service-request status across both sides",
      "review disputes, exceptions, or partner quality issues",
    ],
    shouldHaveFeatures: ["support partner performance summaries", "send transactional updates to both sides"],
    couldHaveFeatures: ["automated ranking or recommendation logic"],
    wontHaveNow: ["full commission settlement and advanced marketplace finance"],
    extraFlows: [
      { name: "Partner Onboarding Flow", description: "Approve sellers and publish their listings.", relatedTheme: "seller" },
      { name: "Buyer Request Flow", description: "Capture buyer intent and route it to the right seller.", relatedTheme: "buyer" },
      { name: "Dispute / Exception Flow", description: "Handle conflicts or escalations between marketplace actors.", relatedTheme: "dispute" },
    ],
    screenHints: [
      { name: "Partner Profile", purpose: "Review or manage marketplace seller information." },
      { name: "Listing Management", purpose: "Publish and maintain marketplace listings." },
    ],
    metrics: ["Partner activation rate", "Match-to-conversion rate", "Dispute resolution time", "Marketplace throughput"],
    clarificationQuestions: [
      "Will the marketplace handle direct transactions or only qualified leads / requests?",
      "What approvals are needed before a seller goes live?",
    ],
  },
  {
    projectType: "CRM",
    domain: "Customer Relationship Management",
    systemType: "Sales and customer pipeline management system",
    triggers: ["crm", "lead", "deal", "customer", "contact", "pipeline", "عميل", "صفقة", "متابعة", "قمع"],
    defaultRoles: ["Sales Rep", "Sales Manager", "Administrator"],
    entities: ["Lead", "Contact", "Deal", "Activity", "Pipeline stage"],
    mustHaveFeatures: [
      "capture leads and customer details",
      "move deals through pipeline stages with clear ownership",
      "record follow-up activities, notes, and reminders",
      "provide sales dashboards and progress reporting",
    ],
    shouldHaveFeatures: ["support lead assignment rules", "track lost-reason analysis"],
    couldHaveFeatures: ["automated lead scoring or playbooks"],
    wontHaveNow: ["full marketing automation orchestration"],
    extraFlows: [
      { name: "Lead Management Flow", description: "Capture, qualify, and assign incoming leads.", relatedTheme: "lead" },
      { name: "Deal Follow-up Flow", description: "Advance deals, log activities, and manage next steps.", relatedTheme: "deal" },
      { name: "Reporting Flow", description: "Review conversion, aging, and team performance metrics.", relatedTheme: "report" },
    ],
    screenHints: [
      { name: "Lead Board", purpose: "Track lead status and ownership." },
      { name: "Deal Pipeline", purpose: "Visualize movement across sales stages." },
    ],
    metrics: ["Lead response time", "Stage conversion rate", "Pipeline aging", "Follow-up completion rate"],
    clarificationQuestions: [
      "Is the initial scope sales-only or should it include post-sale account management?",
      "How detailed should lead qualification rules be?",
    ],
  },
  {
    projectType: "ERP",
    domain: "Business Operations and Resource Planning",
    systemType: "Operational ERP workflow platform",
    triggers: ["erp", "procurement", "inventory", "finance", "resource", "operations", "موارد", "مشتريات", "مخزون", "مالية"],
    defaultRoles: ["Employee", "Department Manager", "Operations Controller", "Administrator"],
    entities: ["Request", "Approval step", "Department record", "Inventory movement", "Operational report"],
    mustHaveFeatures: [
      "capture structured internal requests",
      "route approvals across departments and roles",
      "track operational status and ownership",
      "report on throughput and bottlenecks",
    ],
    shouldHaveFeatures: ["support audit history and role-based escalation", "surface departmental workload views"],
    couldHaveFeatures: ["cross-module integrations or advanced planning logic"],
    wontHaveNow: ["full financial accounting orchestration"],
    extraFlows: [
      { name: "Approval Chain Flow", description: "Move requests across departmental reviewers.", relatedTheme: "approval" },
      { name: "Operational Status Flow", description: "Track progress and exceptions after approval.", relatedTheme: "operations" },
    ],
    screenHints: [
      { name: "Approval Chain", purpose: "Review request routing across departments." },
      { name: "Department Dashboard", purpose: "Track workload and bottlenecks by team." },
    ],
    metrics: ["Approval turnaround time", "Department backlog aging", "Exception recovery time", "Operational SLA attainment"],
    clarificationQuestions: [
      "Which departments are in scope for the first release?",
      "Do approvals need sequential routing, parallel routing, or both?",
    ],
  },
  {
    projectType: "Education Platform",
    domain: "Education and Learning Operations",
    systemType: "Education platform for learners, educators, and administrators",
    triggers: ["school", "student", "teacher", "coach", "course", "lesson", "exam", "learning", "academy", "طالب", "مدرسة", "درس", "امتحان"],
    defaultRoles: ["Guest", "Student", "Teacher / Coach", "Parent / Guardian", "Administrator"],
    entities: ["Student profile", "Lesson", "Class enrollment", "Assessment", "Progress report"],
    mustHaveFeatures: [
      "manage student onboarding and profiles",
      "organize lessons, classes, or learning sessions",
      "track attendance, progress, and assessment outcomes",
      "support communication between educators, learners, and guardians",
    ],
    shouldHaveFeatures: ["surface teacher workload and class summaries", "handle assessment follow-up actions"],
    couldHaveFeatures: ["content authoring or advanced learning analytics"],
    wontHaveNow: ["full LMS authoring and certificate management"],
    extraFlows: [
      { name: "Lesson / Session Flow", description: "Plan, assign, and deliver lessons or sessions.", relatedTheme: "lesson" },
      { name: "Assessment Flow", description: "Capture exams, results, and follow-up decisions.", relatedTheme: "assessment" },
      { name: "Attendance Flow", description: "Record attendance and notify stakeholders when exceptions occur.", relatedTheme: "attendance" },
    ],
    screenHints: [
      { name: "Class Schedule", purpose: "Review lessons, sessions, and assigned educators." },
      { name: "Assessment Overview", purpose: "Track evaluation results and pending actions." },
    ],
    metrics: ["Enrollment completion rate", "Attendance capture rate", "Assessment turnaround time", "Parent communication response rate"],
    clarificationQuestions: [
      "Does the first release focus on operations only, or also on learning content delivery?",
      "How should teachers and guardians receive progress updates?",
    ],
  },
  {
    projectType: "Admin Dashboard",
    domain: "Administrative Operations",
    systemType: "Administrative dashboard and management console",
    triggers: ["dashboard", "admin", "analytics", "manage", "permissions", "statistics", "لوحة", "إدارة", "إحصائيات", "صلاحيات"],
    defaultRoles: ["Administrator", "Operations Manager", "Analyst"],
    entities: ["Dashboard widget", "Permission set", "Audit log", "Operational record", "Alert"],
    mustHaveFeatures: [
      "display operational summaries and performance indicators",
      "manage permissions and access levels",
      "review audit history and exception queues",
      "filter and inspect records from a central console",
    ],
    shouldHaveFeatures: ["support alerting or threshold-based monitoring", "export filtered reports"],
    couldHaveFeatures: ["configurable widgets or custom reporting"],
    wontHaveNow: ["advanced observability and incident automation"],
    extraFlows: [
      { name: "Permission Management Flow", description: "Assign and change admin permissions safely.", relatedTheme: "permission" },
      { name: "Reporting / Statistics Flow", description: "Filter and export operational analytics.", relatedTheme: "statistics" },
    ],
    screenHints: [
      { name: "Statistics Overview", purpose: "Review KPIs and trend indicators quickly." },
      { name: "Permissions Console", purpose: "Manage roles and access rights." },
    ],
    metrics: ["Dashboard usage rate", "Alert acknowledgement time", "Permission change turnaround", "Report export usage"],
    clarificationQuestions: [
      "Is this dashboard standalone or attached to an existing operational system?",
      "Which metrics are considered critical on day one?",
    ],
  },
  {
    projectType: "Mobile App",
    domain: "Mobile Experience",
    systemType: "Mobile-first product experience",
    triggers: ["mobile", "ios", "android", "app", "push", "notification", "جوال", "موبايل", "تطبيق"],
    defaultRoles: ["Guest", "Registered User", "Administrator"],
    entities: ["Mobile session", "Push notification", "Action item", "Profile", "Preference"],
    mustHaveFeatures: [
      "optimize the core workflow for mobile-first interaction",
      "support account access and personalized actions",
      "surface timely notifications and clear next steps",
      "retain task progress across interrupted sessions",
    ],
    shouldHaveFeatures: ["support offline recovery messaging", "capture device preferences"],
    couldHaveFeatures: ["deep links and native sharing flows"],
    wontHaveNow: ["advanced device telemetry or multi-app orchestration"],
    extraFlows: [
      { name: "Push Notification Flow", description: "Trigger and resolve mobile follow-up actions.", relatedTheme: "notification" },
      { name: "Session Recovery Flow", description: "Resume interrupted actions cleanly on mobile.", relatedTheme: "session" },
    ],
    screenHints: [
      { name: "Mobile Home", purpose: "Summarize the next actions for a mobile user." },
      { name: "Action Feed", purpose: "Provide a condensed list of items requiring attention." },
    ],
    metrics: ["Task completion on mobile", "Push engagement rate", "Session recovery success", "Notification response time"],
    clarificationQuestions: [
      "Is the first release mobile-only or mobile-first with a matching web console?",
      "Which actions must remain possible during short, interrupted sessions?",
    ],
  },
  {
    projectType: "General Digital Product",
    domain: "General Product Discovery",
    systemType: "General digital product workflow",
    triggers: [],
    defaultRoles: ["Guest", "Registered User", "Administrator"],
    entities: ["Request", "Record", "Status update", "Decision log", "Notification"],
    mustHaveFeatures: [
      "capture structured user input",
      "validate required data and status transitions",
      "show role-based visibility and workflow progress",
      "support review, approval, and exception handling where needed",
    ],
    shouldHaveFeatures: ["send notifications when status changes", "provide dashboard summaries"],
    couldHaveFeatures: ["offer configurable workflow steps"],
    wontHaveNow: ["deep automation and broad third-party integrations"],
    extraFlows: [],
    screenHints: [],
    metrics: ["Workflow completion rate", "Turnaround time", "Exception resolution time", "Stakeholder approval rate"],
    clarificationQuestions: [
      "What is the single most important user outcome for the first release?",
      "Which team or role owns review and exception handling?",
    ],
  },
];

export function getProjectTemplate(projectType: ProjectType): ProjectTemplate {
  return (
    PROJECT_TYPE_TEMPLATES.find((template) => template.projectType === projectType) ??
    PROJECT_TYPE_TEMPLATES[PROJECT_TYPE_TEMPLATES.length - 1]
  );
}
