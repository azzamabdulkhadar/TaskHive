export const API_BASE = "/api/v1";

export const PRIORITY_COLORS = {
  low:    { bg: "var(--color-info-light)",    text: "var(--color-info)",    label: "Low" },
  medium: { bg: "var(--color-warning-light)", text: "var(--color-warning)", label: "Medium" },
  high:   { bg: "var(--color-danger-light)",  text: "var(--color-danger)",  label: "High" },
  urgent: { bg: "#fce7f3",                    text: "#db2777",              label: "Urgent" },
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
  proposal:    { bg: "#fce7f3",                    text: "#db2777",              label: "Proposal" },
  negotiation: { bg: "#f3e8ff",                    text: "#9333ea",              label: "Negotiation" },
  won:         { bg: "var(--color-success-light)", text: "var(--color-success)", label: "Won" },
  lost:        { bg: "var(--color-danger-light)",  text: "var(--color-danger)",  label: "Lost" },
  archived:    { bg: "var(--color-bg-secondary)",  text: "var(--color-text-muted)", label: "Archived" },
};

export const LEAD_SOURCES = ["website","referral","social","direct","email","phone","others"];
export const LEAD_TYPES   = ["visit","meeting","enquiry","delivery","others"];
export const NOTE_COLORS  = ["#ffffff","#fef9c3","#dcfce7","#dbeafe","#fce7f3","#f3e8ff","#ffedd5"];
