import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutGrid, List, Plus, Search, Trash2, Edit3, Phone, Mail, Building2, Tag, ExternalLink,
} from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import DescriptionText from "../../components/ui/DescriptionText";
import { getLeads, createLead, updateLead, deleteLead } from "../../services/api/leadsService";
import { STATUS_COLORS, PRIORITY_COLORS, LEAD_SOURCES, LEAD_TYPES } from "../../constants";
import { formatDate, debounce } from "../../utils";
import styles from "./Leads.module.css";

const EMPTY_FORM = {
  name: "", company: "", email: "", phone: "", alternatePhone: "",
  type: "enquiry", source: "direct", status: "new", priority: "medium",
  tags: "", description: "", visitReason: "", nextFollowUpAt: "",
};

const STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "archived"];

/* ─── Lead table row ─────────────────────────────────────── */
const CLOSED_STATUSES = ["won", "lost", "archived"];

const isLeadExpired = (lead) =>
  !!lead.nextFollowUpAt &&
  !CLOSED_STATUSES.includes(lead.status) &&
  new Date(lead.nextFollowUpAt).getTime() < new Date().setHours(0, 0, 0, 0);

/* ─── Lead card (same element for grid + list; layout animates between) ─── */
const LeadCard = ({ lead, view, onEdit, onDelete, onView }) => {
  const sc = STATUS_COLORS[lead.status]     || STATUS_COLORS.new;
  const pc = PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium;
  const expired = isLeadExpired(lead);
  const isList = view === "list";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={[styles.gridCard, isList ? styles.listCard : "", expired ? styles.gridCardExpired : ""].join(" ")}
    >
      <div className={styles.cardMain}>
        <div className={styles.leadName} style={{ cursor: "pointer" }} onClick={() => onView(lead._id)}>{lead.name}</div>
        {lead.company && <div className={styles.leadCompany}><Building2 size={11} />{lead.company}</div>}
      </div>
      <div className={styles.cardContact}>
        {lead.email && <div className={styles.contact}><Mail size={11} />{lead.email}</div>}
        {lead.phone && <div className={styles.contact}><Phone size={11} />{lead.phone}</div>}
      </div>
      <div className={styles.gridBadges}>
        <Badge bg={sc.bg} color={sc.text} dot>{sc.label}</Badge>
        <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
        {expired && <span className={styles.expiredBadge}>Expired</span>}
      </div>
      <div className={[styles.dateText, styles.cardDate, expired ? styles.dateExpired : ""].join(" ")}>
        Follow-up: {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : "—"}
      </div>
      <div className={styles.cardActions}>
        <button className={styles.actionBtn} onClick={() => onView(lead._id)} title="View profile"><ExternalLink size={14} /></button>
        <button className={styles.actionBtn} onClick={() => onEdit(lead)} title="Edit"><Edit3 size={14} /></button>
        <button className={[styles.actionBtn, styles.danger].join(" ")} onClick={() => onDelete(lead._id)} title="Delete"><Trash2 size={14} /></button>
      </div>
      {lead.tags?.length > 0 && (
        <div className={[styles.tagList, styles.cardWide].join(" ")}>
          {lead.tags.map((t) => <span key={t} className={styles.tag}><Tag size={10} />{t}</span>)}
        </div>
      )}
      {lead.description && (
        <DescriptionText text={lead.description} maxChars={isList ? 300 : 140} className={[styles.leadDesc, styles.cardWide].join(" ")} />
      )}
    </motion.div>
  );
};

/* ─── Leads page ─────────────────────────────────────────── */
const Leads = () => {
  const navigate = useNavigate();

  // ── Master list — NEVER filtered at the API level for pipeline counts ──
  const [allLeads, setAllLeads]       = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── UI filter state (applied client-side to allLeads) ──────────────────
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus]     = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterExpiry, setFilterExpiry]     = useState("");
  const [view, setView] = useState(() => localStorage.getItem("engagementsView") || "list");
  const changeView = (v) => { setView(v); localStorage.setItem("engagementsView", v); };

  // ── Modal ──────────────────────────────────────────────────────────────
  const [modal, setModal]     = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  // ── Load ALL leads once (no filter params) ─────────────────────────────
  const loadAllLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({ limit: 200 });
      setAllLeads(res.data?.data?.leads ?? []);
    } catch {
      toast.error("Failed to load engagements");
    } finally {
      setLoading(false);
    }
  }, []); // stable — no filter deps

  useEffect(() => { loadAllLeads(); }, [loadAllLeads]);

  // ── Client-side filtering ──────────────────────────────────────────────
  const visibleLeads = useMemo(() => {
    let list = allLeads;

    if (filterStatus)   list = list.filter((l) => l.status   === filterStatus);
    if (filterPriority) list = list.filter((l) => l.priority === filterPriority);
    if (filterExpiry === "expired") list = list.filter(isLeadExpired);
    if (filterExpiry === "active")  list = list.filter((l) => !isLeadExpired(l));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(q)    ||
          l.company?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)   ||
          l.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allLeads, filterStatus, filterPriority, filterExpiry, search]);

  // Pipeline counts always come from the FULL dataset, not visibleLeads
  const pipelineCounts = useMemo(() => {
    const counts = {};
    STATUSES.forEach((s) => { counts[s] = allLeads.filter((l) => l.status === s).length; });
    return counts;
  }, [allLeads]);

  // ── CRUD ───────────────────────────────────────────────────────────────
  const openCreate = () => { setEditLead(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit = (l) => {
    setEditLead(l);
    setForm({
      name: l.name, company: l.company || "", email: l.email || "", phone: l.phone || "",
      alternatePhone: l.alternatePhone || "", type: l.type || "enquiry", source: l.source || "direct",
      status: l.status || "new", priority: l.priority || "medium",
      tags: (l.tags || []).join(", "), description: l.description || "",
      visitReason: l.visitReason || "",
      nextFollowUpAt: l.nextFollowUpAt ? formatDate(l.nextFollowUpAt, "YYYY-MM-DD") : "",
    });
    setErrors({});
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: "Name is required" }); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editLead) {
        const res = await updateLead(editLead._id, payload);
        const updated = res.data.data.lead;
        setAllLeads((prev) => prev.map((x) => x._id === editLead._id ? updated : x));
        toast.success("Engagement updated");
      } else {
        const res = await createLead(payload);
        const created = res.data.data.lead;
        setAllLeads((prev) => [created, ...prev]);
        toast.success("Engagement created");
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this engagement?")) return;
    try {
      await deleteLead(id);
      setAllLeads((prev) => prev.filter((x) => x._id !== id));
      toast.success("Engagement deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // Pipeline chip toggle — clicking the active chip resets the filter
  const handleChipClick = (s) => {
    setFilterStatus((prev) => (prev === s ? "" : s));
  };

  return (
    <div className={styles.page}>
      <Topbar
        title="Engagements"
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Engagement</Button>}
      />

      <div className={styles.content}>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <div style={{ flex: 1, maxWidth: 280 }}>
            <Input
              placeholder="Search engagements…"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_COLORS[s]?.label ?? s}</option>
            ))}
          </Select>
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">All priorities</option>
            {["low", "medium", "high", "urgent"].map((p) => (
              <option key={p} value={p}>{PRIORITY_COLORS[p]?.label ?? p}</option>
            ))}
          </Select>
          <Select
            value={filterExpiry}
            onChange={(e) => setFilterExpiry(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All dates</option>
            <option value="expired">Expired</option>
            <option value="active">Not expired</option>
          </Select>
          <button
            className={styles.viewToggle}
            onClick={() => changeView(view === "list" ? "grid" : "list")}
            title={view === "list" ? "Switch to grid view" : "Switch to list view"}
          >
            {view === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
        </div>

        {/* ── Pipeline chips — counts from full dataset ── */}
        <div className={styles.pipeline}>
          {STATUSES.map((s) => {
            const sc = STATUS_COLORS[s];
            return (
              <button
                key={s}
                className={[styles.pipelineChip, filterStatus === s ? styles.active : ""].join(" ")}
                onClick={() => handleChipClick(s)}
                style={{ "--pc": sc.text, "--pb": sc.bg }}
              >
                <span className={styles.pipelineDot} />
                {sc.label}
                <span className={styles.pipelineCount}>{pipelineCounts[s] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} />
            ))}
          </div>
        ) : visibleLeads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={22} /></div>
            <h3>{allLeads.length === 0 ? "No engagements yet" : "No engagements match your filters"}</h3>
            <p>
              {allLeads.length === 0
                ? "Start adding visitors, meetings and enquiries."
                : "Try clearing the search or selecting a different status."}
            </p>
            {allLeads.length === 0 && (
              <Button onClick={openCreate} icon={<Plus size={14} />}>Add Engagement</Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className={[styles.grid, view === "list" ? styles.listGrid : ""].join(" ")}>
              {visibleLeads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  view={view}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onView={(id) => navigate(`/app/leads/${id}`)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editLead ? "Edit Engagement" : "New Engagement"}
        width={600}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>
              {editLead ? "Save Changes" : "Create Engagement"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Name *" placeholder="Full name" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
            <Input label="Company" placeholder="Company name" value={form.company}
              icon={<Building2 size={14} />}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Email" type="email" placeholder="email@example.com" value={form.email}
              icon={<Mail size={14} />}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" type="tel" placeholder="+1 234 567 8900" value={form.phone}
              icon={<Phone size={14} />}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Status" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_COLORS[s]?.label ?? s}</option>
              ))}
            </Select>
            <Select label="Priority" value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {["low", "medium", "high", "urgent"].map((p) => (
                <option key={p} value={p}>{PRIORITY_COLORS[p]?.label ?? p}</option>
              ))}
            </Select>
            <Select label="Source" value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Type" value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {LEAD_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </Select>
            <Input label="Next Follow-up" type="date" value={form.nextFollowUpAt}
              onChange={(e) => setForm((f) => ({ ...f, nextFollowUpAt: e.target.value }))} />
          </div>
          <Input label="Tags (comma-separated)" placeholder="e.g. vip, hot-lead"
            icon={<Tag size={14} />} value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          <Textarea label="Description" placeholder="Notes about this engagement…" rows={3}
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
