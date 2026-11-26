export const API_BASE = "/api/v1";

export const PRIORITY_COLORS = {
  low:    { bg: "var(--color-info-light)",    text: "var(--color-info)",    label: "Low" },
  medium: { bg: "var(--color-warning-light)", text: "var(--color-warning)", label: "Medium" },
  high:   { bg: "var(--color-danger-light)",  text: "var(--color-danger)",  label: "High" },
  urgent: { bg: "var(--color-danger-light)",  text: "var(--color-danger)",  label: "Urgent" },
};

export const STATUS_COLORS = {
  // Event statuses
  upcoming:    { bg: "var(--color-info-light)",    text: "var(--color-info)",    label: "Upcoming" },
  in_progress: { bg: "var(--color-warning-light)", text: "var(--color-warning)", label: "In Progress" },
  completed:   { bg: "var(--color-success-light)", text: "var(--color-success)", label: "Completed" },
  cancelled:   { bg: "var(--color-bg-secondary)",  text: "var(--color-text-muted)", label: "Cancelled" },
  // Lead statuses
  new:         { bg: "var(--color-info-light)",    text: "var(--color-info)",    label: "New" },
  contacted:   { bg: "var(--color-primary-light)", text: "var(--color-primary)", label: "Contacted" },
  qualified:   { bg: "var(--color-warning-light)", text: "var(--color-warning)", label: "Qualified" },
  proposal:    { bg: "var(--color-accent-rose-light)",  text: "var(--color-accent-rose)",  label: "Proposal" },
  negotiation: { bg: "var(--color-accent-slate-light)", text: "var(--color-accent-slate)", label: "Negotiation" },
  won:         { bg: "var(--color-success-light)", text: "var(--color-success)", label: "Won" },
  lost:        { bg: "var(--color-danger-light)",  text: "var(--color-danger)",  label: "Lost" },
  archived:    { bg: "var(--color-bg-secondary)",  text: "var(--color-text-muted)", label: "Archived" },
};

export const LEAD_SOURCES = ["website","referral","social","direct","email","phone","others"];
export const LEAD_TYPES   = ["visit","meeting","enquiry","delivery","others"];
export const NOTE_COLORS  = ["#ffffff","#f6f1dc","#e4ecdb","#dfe9f1","#f1e3e6","#e8e6f0","#f3e6d8"];
