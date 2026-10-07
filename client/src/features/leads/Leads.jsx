import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus, Search, Trash2, Edit3, Phone, Mail, Building2, Tag, ExternalLink,
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
const LeadRow = ({ lead, onEdit, onDelete, onView }) => {
  const sc = STATUS_COLORS[lead.status]     || STATUS_COLORS.new;
  const pc = PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium;
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.tableRow}
    >
      <td className={styles.td}>
        <div
          className={styles.leadName}
          style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: "transparent", transition: "text-decoration-color 0.15s" }}
          onClick={() => onView(lead._id)}
          title="View profile"
        >{lead.name}</div>
        {lead.company && (
          <div className={styles.leadCompany}><Building2 size={11} />{lead.company}</div>
        )}
        {lead.description && (
          <DescriptionText
            text={lead.description}
            maxChars={80}
            className={styles.leadDesc}
          />
        )}
      </td>
      <td className={styles.td}>
        {lead.email && <div className={styles.contact}><Mail size={11} />{lead.email}</div>}
        {lead.phone && <div className={styles.contact}><Phone size={11} />{lead.phone}</div>}
      </td>
      <td className={styles.td}>
        <Badge bg={sc.bg} color={sc.text} dot>{sc.label}</Badge>
      </td>
      <td className={styles.td}>
        <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
      </td>
      <td className={styles.td}>
        <span className={styles.dateText}>
          {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : "—"}
        </span>
      </td>
      <td className={styles.td}>
        <div className={styles.rowActions}>
          <button className={styles.actionBtn} onClick={() => onView(lead._id)} title="View profile">
            <ExternalLink size={14} />
          </button>
          <button className={styles.actionBtn} onClick={() => onEdit(lead)} title="Edit">
            <Edit3 size={14} />
          </button>
          <button
            className={[styles.actionBtn, styles.danger].join(" ")}
            onClick={() => onDelete(lead._id)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
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
      toast.error("Failed to load leads");
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
  }, [allLeads, filterStatus, filterPriority, search]);

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
        toast.success("Lead updated");
      } else {
        const res = await createLead(payload);
        const created = res.data.data.lead;
        setAllLeads((prev) => [created, ...prev]);
        toast.success("Lead created");
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await deleteLead(id);
      setAllLeads((prev) => prev.filter((x) => x._id !== id));
      toast.success("Lead deleted");
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
        title="Leads"
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Lead</Button>}
      />

      <div className={styles.content}>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <div style={{ flex: 1, maxWidth: 280 }}>
            <Input
              placeholder="Search leads…"
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
            <h3>{allLeads.length === 0 ? "No leads yet" : "No leads match your filters"}</h3>
            <p>
              {allLeads.length === 0
                ? "Start adding contacts and enquiries to build your CRM."
                : "Try clearing the search or selecting a different status."}
            </p>
            {allLeads.length === 0 && (
              <Button onClick={openCreate} icon={<Plus size={14} />}>Add Lead</Button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.colName} />
                <col className={styles.colContact} />
                <col className={styles.colStatus} />
                <col className={styles.colPrio} />
                <col className={styles.colFollowup} />
                <col className={styles.colActions} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.th}>Name / Company</th>
                  <th className={styles.th}>Contact</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Priority</th>
                  <th className={styles.th}>Follow-up</th>
                  <th className={styles.th} />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visibleLeads.map((lead) => (
                    <LeadRow
                      key={lead._id}
                      lead={lead}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onView={(id) => navigate(`/app/leads/${id}`)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editLead ? "Edit Lead" : "New Lead"}
        width={600}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>
              {editLead ? "Save Changes" : "Create Lead"}
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
          <Textarea label="Description" placeholder="Notes about this lead…" rows={3}
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
