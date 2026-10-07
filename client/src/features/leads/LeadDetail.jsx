import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft, Edit3, Trash2, Mail, Phone, Building2, Tag,
  Calendar, MapPin, User, TrendingUp, StickyNote, CheckCircle2,
  CalendarDays, Users, Clock, Globe, Zap, AlertCircle,
} from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { getLeadById, updateLead, deleteLead } from "../../services/api/leadsService";
import { getActivity } from "../../services/api/activityService";
import { STATUS_COLORS, PRIORITY_COLORS, LEAD_SOURCES, LEAD_TYPES } from "../../constants";
import { formatDate, fromNow } from "../../utils";
import styles from "./LeadDetail.module.css";

const STATUSES  = ["new","contacted","qualified","proposal","negotiation","won","lost","archived"];
const PRIORITIES = ["low","medium","high","urgent"];

const ENTITY_ICON  = { note: StickyNote, event: CalendarDays, lead: Users, auth: TrendingUp, file: StickyNote };
const ACTION_COLOR = {
  CREATE: "var(--color-success)", UPDATE: "var(--color-info)",
  DELETE: "var(--color-danger)",  STATUS_CHANGE: "var(--color-warning)",
  LOGIN: "var(--color-primary)",  LOGOUT: "var(--color-text-muted)", UPLOAD: "var(--color-info)",
};

/* ── Info row helper ──────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}><Icon size={14} /></div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    </div>
  );
};

/* ── Status stepper ───────────────────────────────────────── */
const StatusStepper = ({ current, onChange, saving }) => (
  <div className={styles.stepper}>
    {STATUSES.map((s) => {
      const sc = STATUS_COLORS[s] || STATUS_COLORS.new;
      const isActive = s === current;
      const isPast   = STATUSES.indexOf(s) < STATUSES.indexOf(current);
      return (
        <button
          key={s}
          className={[
            styles.stepBtn,
            isActive ? styles.stepActive : "",
            isPast   ? styles.stepPast   : "",
          ].join(" ")}
          style={isActive ? { "--sc": sc.text, "--sb": sc.bg } : {}}
          onClick={() => !saving && s !== current && onChange(s)}
          disabled={saving}
          title={sc.label}
        >
          <span className={styles.stepDot} />
          <span className={styles.stepLabel}>{sc.label}</span>
        </button>
      );
    })}
  </div>
);

/* ── LeadDetail ───────────────────────────────────────────── */
const LeadDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [lead, setLead]         = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actLoading, setActLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  // Edit modal
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Load lead
  const loadLead = useCallback(async () => {
    try {
      const res = await getLeadById(id);
      setLead(res.data?.data?.lead ?? null);
    } catch {
      toast.error("Lead not found");
      navigate("/app/leads");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Load activity for this lead
  const loadActivity = useCallback(async () => {
    setActLoading(true);
    try {
      const res = await getActivity({ limit: 50 });
      const all  = res.data?.data?.activity ?? [];
      // Filter to this lead's activity entries
      setActivity(all.filter((a) => a.entityId === id || a.entityId?._id === id || String(a.entityId) === String(id)));
    } catch {
      // non-fatal
    } finally {
      setActLoading(false);
    }
  }, [id]);

  useEffect(() => { loadLead(); loadActivity(); }, [loadLead, loadActivity]);

  // Quick status change
  const handleStatusChange = async (newStatus) => {
    setStatusSaving(true);
    try {
      const res = await updateLead(id, { status: newStatus });
      setLead(res.data?.data?.lead);
      toast.success(`Status → ${STATUS_COLORS[newStatus]?.label ?? newStatus}`);
      loadActivity();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusSaving(false);
    }
  };

  // Open edit modal
  const openEdit = () => {
    if (!lead) return;
    setForm({
      name: lead.name, company: lead.company || "", email: lead.email || "",
      phone: lead.phone || "", alternatePhone: lead.alternatePhone || "",
      type: lead.type || "others", source: lead.source || "others",
      status: lead.status, priority: lead.priority,
      tags: (lead.tags || []).join(", "),
      description: lead.description || "", visitReason: lead.visitReason || "",
      nextFollowUpAt: lead.nextFollowUpAt
        ? new Date(lead.nextFollowUpAt).toISOString().split("T")[0]
        : "",
    });
    setErrors({});
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) { setErrors({ name: "Name is required" }); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await updateLead(id, payload);
      setLead(res.data?.data?.lead);
      toast.success("Lead updated");
      setModal(false);
      loadActivity();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await deleteLead(id);
      toast.success("Lead deleted");
      navigate("/app/leads");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Topbar title="Lead" />
        <div className={styles.content}>
          <div className={styles.skeletonHeader}><div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-xl)" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-5)" }}>
            {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: "var(--radius-xl)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const sc = STATUS_COLORS[lead.status]     || STATUS_COLORS.new;
  const pc = PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium;

  return (
    <div className={styles.page}>
      <Topbar
        title="Lead Detail"
        actions={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={openEdit}>Edit</Button>
            <Button variant="danger"    size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      <div className={styles.content}>
        {/* Back link */}
        <Link to="/app/leads" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Leads
        </Link>

        {/* Hero card */}
        <motion.div
          className={["card", styles.heroCard].join(" ")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.heroLeft}>
            <div className={styles.heroAvatar}>
              {lead.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <h2 className={styles.heroName}>{lead.name}</h2>
              {lead.company && (
                <div className={styles.heroCompany}><Building2 size={13} />{lead.company}</div>
              )}
              <div className={styles.heroBadges}>
                <Badge bg={sc.bg} color={sc.text} dot>{sc.label}</Badge>
                <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
                {lead.type && (
                  <Badge bg="var(--color-bg-secondary)" color="var(--color-text-secondary)">
                    {lead.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaItem}>
                <Calendar size={13} /> Created {formatDate(lead.createdAt)}
              </span>
              {lead.nextFollowUpAt && (
                <span className={[styles.heroMetaItem, styles.followUp].join(" ")}>
                  <Clock size={13} /> Follow-up {formatDate(lead.nextFollowUpAt)}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status stepper */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
        >
          <h3 className={styles.cardTitle}><Zap size={15} /> Pipeline Stage</h3>
          <StatusStepper current={lead.status} onChange={handleStatusChange} saving={statusSaving} />
        </motion.div>

        {/* Details + Activity */}
        <div className={styles.bodyGrid}>
          {/* Left — details */}
          <motion.div
            className={styles.leftCol}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
          >
            {/* Contact */}
            <div className="card">
              <h3 className={styles.cardTitle}><User size={15} /> Contact Info</h3>
              <div className={styles.infoList}>
                <InfoRow icon={Mail}  label="Email"          value={lead.email}          />
                <InfoRow icon={Phone} label="Phone"          value={lead.phone}          />
                <InfoRow icon={Phone} label="Alt. Phone"     value={lead.alternatePhone} />
                <InfoRow icon={Globe} label="Source"         value={lead.source}         />
                <InfoRow icon={MapPin} label="Visit Reason"  value={lead.visitReason}    />
              </div>
            </div>

            {/* Tags */}
            {lead.tags?.length > 0 && (
              <div className="card">
                <h3 className={styles.cardTitle}><Tag size={15} /> Tags</h3>
                <div className={styles.tagList}>
                  {lead.tags.map((t) => (
                    <span key={t} className={styles.tag}><Tag size={10} />{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {lead.description && (
              <div className="card">
                <h3 className={styles.cardTitle}><AlertCircle size={15} /> Description</h3>
                <p className={styles.descText}>{lead.description}</p>
              </div>
            )}
          </motion.div>

          {/* Right — activity timeline */}
          <motion.div
            className={styles.rightCol}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.3 }}
          >
            <div className="card" style={{ height: "100%" }}>
              <h3 className={styles.cardTitle}><TrendingUp size={15} /> Activity Timeline</h3>

              {actLoading ? (
                <div className={styles.timelineSkeleton}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-md)" }} />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="empty-state" style={{ padding: "var(--space-8) 0" }}>
                  <div className="empty-state-icon"><TrendingUp size={20} /></div>
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                <div className={styles.timeline}>
                  <AnimatePresence>
                    {activity.map((a, idx) => {
                      const Icon  = ENTITY_ICON[a.entityType] || CheckCircle2;
                      const color = ACTION_COLOR[a.action] || "var(--color-primary)";
                      return (
                        <motion.div
                          key={a._id}
                          className={styles.timelineItem}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <div className={styles.timelineTrack}>
                            <div className={styles.timelineIcon} style={{ background: `${color}18`, color }}>
                              <Icon size={12} />
                            </div>
                            {idx < activity.length - 1 && <div className={styles.timelineLine} />}
                          </div>
                          <div className={styles.timelineBody}>
                            <span className={styles.timelineAction}>
                              <strong>{a.action.replace("_", " ")}</strong>
                              {a.metadata?.from && a.metadata?.to
                                ? ` · ${a.metadata.from} → ${a.metadata.to}`
                                : ""}
                            </span>
                            <span className={styles.timelineTime}><Clock size={10} /> {fromNow(a.createdAt)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Edit Lead"
        width={600}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Name *" value={form.name || ""} error={errors.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Company" value={form.company || ""}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Email" type="email" value={form.email || ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Status" value={form.status || "new"}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_COLORS[s]?.label ?? s}</option>)}
            </Select>
            <Select label="Priority" value={form.priority || "medium"}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_COLORS[p]?.label ?? p}</option>)}
            </Select>
            <Select label="Source" value={form.source || "others"}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Type" value={form.type || "others"}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input label="Next Follow-up" type="date" value={form.nextFollowUpAt || ""}
              onChange={(e) => setForm((f) => ({ ...f, nextFollowUpAt: e.target.value }))} />
          </div>
          <Input label="Tags (comma-separated)" placeholder="e.g. hot, enterprise"
            icon={<Tag size={14} />} value={form.tags || ""}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          <Textarea label="Description" rows={3} value={form.description || ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Visit Reason" value={form.visitReason || ""}
            onChange={(e) => setForm((f) => ({ ...f, visitReason: e.target.value }))} />
        </form>
      </Modal>
    </div>
  );
};

export default LeadDetail;
