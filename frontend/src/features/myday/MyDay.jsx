import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plus, Layers, Check, MoreVertical, Edit3, Trash2, ChevronLeft, ChevronRight,
  SkipForward, ChevronDown, CheckSquare, CalendarDays, Users, Coffee, Reply, Bell, Clock,
} from "lucide-react";
import dayjs from "dayjs";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { getDayTasks, createDayTask, updateDayTask, deleteDayTask } from "../../services/api/dayTasksService";
import styles from "./MyDay.module.css";

const TYPES = {
  task:     { label: "Task",      icon: CheckSquare, color: "#b98a3e", bg: "color-mix(in srgb, #b98a3e 16%, transparent)" },
  meeting:  { label: "Meeting",   icon: CalendarDays, color: "#6f78a8", bg: "color-mix(in srgb, #6f78a8 16%, transparent)" },
  visit:    { label: "Visit",     icon: Users,       color: "#6f9a5a", bg: "color-mix(in srgb, #6f9a5a 16%, transparent)" },
  personal: { label: "Personal",  icon: Coffee,      color: "#5f8aa6", bg: "color-mix(in srgb, #5f8aa6 16%, transparent)" },
  followup: { label: "Follow-up", icon: Reply,       color: "#5f9a8f", bg: "color-mix(in srgb, #5f9a8f 16%, transparent)" },
  reminder: { label: "Reminder",  icon: Bell,        color: "#96606f", bg: "color-mix(in srgb, #96606f 16%, transparent)" },
};

const STATUSES = {
  pending: { label: "Pending", color: "#b98a3e", bg: "color-mix(in srgb, #b98a3e 16%, transparent)", icon: Clock },
  done:    { label: "Done",    color: "#6f9a5a", bg: "color-mix(in srgb, #6f9a5a 16%, transparent)", icon: Check },
  skipped: { label: "Skipped", color: "#7b8793", bg: "color-mix(in srgb, #7b8793 16%, transparent)", icon: SkipForward },
};

// Older items only have the boolean "done"
const getStatus = (t) => (t.done ? "done" : t.status || "pending");

const PRIORITY_LABEL = { low: "Low priority", medium: "Medium priority", high: "High priority" };

const emptyForm = (day) => ({
  title: "", type: "task", date: day.format("YYYY-MM-DD"), time: dayjs().add(1, "hour").startOf("hour").format("HH:mm"),
  durationMin: "", priority: "medium", notes: "",
});

const formatDuration = (m) => {
  if (!m) return "";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

/* ─── One timeline item ─────────────────────────────────── */
const TaskItem = ({ task, index, onStatus, onEdit, onDelete }) => {
  const [menu, setMenu] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const status = getStatus(task);
  const st = STATUSES[status];
  const meta = TYPES[task.type] || TYPES.task;
  const Icon = meta.icon;
  const sub = [task.notes, PRIORITY_LABEL[task.priority], formatDuration(task.durationMin)].filter(Boolean);

  return (
    <motion.div
      layout
      className={styles.row}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className={styles.time}>{dayjs(task.startAt).format("h:mm A")}</div>
      <span className={styles.dot} style={{ background: meta.color }} />
      <div className={[styles.card, status === "done" ? styles.done : "", status === "skipped" ? styles.skipped : ""].join(" ")}>
        <button
          className={[styles.check, status === "done" ? styles.checked : ""].join(" ")}
          onClick={() => onStatus(task, status === "done" ? "pending" : "done")}
          title={status === "done" ? "Mark as pending" : "Mark as done"}
          style={{ "--tc": meta.color, "--tb": meta.bg }}
        >
          {status === "done" ? <Check size={16} /> : <Icon size={18} />}
        </button>
        <div className={styles.text}>
          <span className={styles.itemTitle}>{task.title}</span>
          <span className={styles.itemSub}>{sub.length ? sub.join(" • ") : meta.label}</span>
        </div>
        <Badge bg={meta.bg} color={meta.color}>{meta.label}</Badge>
        <div className={styles.menuWrap}>
          <button
            className={styles.statusBtn}
            style={{ background: st.bg, color: st.color }}
            onClick={() => setStatusMenu((v) => !v)}
            onBlur={() => setTimeout(() => setStatusMenu(false), 120)}
            title="Change status"
          >
            <st.icon size={12} /> {st.label} <ChevronDown size={12} />
          </button>
          {statusMenu && (
            <div className={styles.menu}>
              {Object.entries(STATUSES).map(([key, s]) => (
                <button key={key} onMouseDown={() => onStatus(task, key)} style={{ color: s.color, fontWeight: key === status ? 600 : 400 }}>
                  <s.icon size={13} /> {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.menuWrap}>
          <button className={styles.menuBtn} onClick={() => setMenu((v) => !v)} onBlur={() => setTimeout(() => setMenu(false), 120)}>
            <MoreVertical size={16} />
          </button>
          {menu && (
            <div className={styles.menu}>
              <button onMouseDown={() => onEdit(task)}><Edit3 size={13} /> Edit</button>
              <button className={styles.menuDanger} onMouseDown={() => onDelete(task)}><Trash2 size={13} /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Page ──────────────────────────────────────────────── */
const MyDay = () => {
  const [day, setDay]         = useState(dayjs().startOf("day"));
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("");
  const [now, setNow]         = useState(dayjs());

  const [modal, setModal]     = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm]       = useState(emptyForm(dayjs()));
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const isToday = day.isSame(dayjs(), "day");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDayTasks({
        startDate: day.startOf("day").toISOString(),
        endDate: day.endOf("day").toISOString(),
      });
      setTasks(res.data?.data?.tasks ?? []);
    } catch {
      toast.error("Failed to load your day");
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(
    () => (filter ? tasks.filter((t) => t.type === filter) : tasks),
    [tasks, filter]
  );

  const doneCount = tasks.filter((t) => getStatus(t) === "done").length;

  // NOW marker sits before the first item that starts after the current time (today only)
  const nowAt = isToday ? visible.findIndex((t) => dayjs(t.startAt).isAfter(now)) : -2;
  const nowIndex = nowAt === -1 ? visible.length : nowAt;

  const NowMarker = () => (
    <div className={styles.nowRow}>
      <span className={styles.nowTime}>{now.format("h:mm A")}</span>
      <span className={styles.nowPill}>NOW</span>
      <span className={styles.nowLine} />
    </div>
  );

  const openCreate = () => { setEditTask(null); setForm(emptyForm(day)); setErrors({}); setModal(true); };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title, type: t.type, date: dayjs(t.startAt).format("YYYY-MM-DD"), time: dayjs(t.startAt).format("HH:mm"),
      durationMin: t.durationMin || "", priority: t.priority, notes: t.notes || "",
    });
    setErrors({});
    setModal(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.time) errs.time = "Time is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        priority: form.priority,
        notes: form.notes,
        durationMin: Number(form.durationMin) || 0,
        startAt: dayjs(`${form.date}T${form.time}`).toISOString(),
      };
      if (editTask) {
        await updateDayTask(editTask._id, payload);
        toast.success("Updated");
      } else {
        await createDayTask(payload);
        toast.success("Added to your day");
      }
      setModal(false);
      // Jump to the day the item was saved on, then reload
      const target = dayjs(form.date).startOf("day");
      if (target.isSame(day, "day")) load(); else setDay(target);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (task, status) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status, done: status === "done" } : t)));
    try {
      await updateDayTask(task._id, { status, done: status === "done" });
    } catch {
      toast.error("Update failed");
      load();
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteDayTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className={styles.page}>
      <Topbar
        title="My Day"
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>Add to My Day</Button>}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}><Layers size={20} /> My Day Timeline</h2>
            <div className={styles.date}>
              {isToday ? "Today · " : ""}{day.format("dddd, MMMM D")}
              {tasks.length > 0 && ` · ${doneCount}/${tasks.length} done`}
            </div>
          </div>
          <div className={styles.controls}>
            <div className={styles.pager}>
              <button onClick={() => setDay((d) => d.subtract(1, "day"))} title="Previous day"><ChevronLeft size={16} /></button>
              <button className={styles.todayBtn} onClick={() => setDay(dayjs().startOf("day"))} disabled={isToday}>Today</button>
              <button onClick={() => setDay((d) => d.add(1, "day"))} title="Next day"><ChevronRight size={16} /></button>
            </div>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">All Activities</option>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        </div>

        <div className={styles.timeline}>
          {loading ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-lg)" }} />)
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Clock size={22} /></div>
              <h3>{tasks.length === 0 ? "Nothing planned for this day" : "No items match this filter"}</h3>
              <p>Add tasks, meetings, visits, reminders and more, each at its own time.</p>
              {tasks.length === 0 && <Button onClick={openCreate} icon={<Plus size={14} />}>Add to My Day</Button>}
            </div>
          ) : (
            <AnimatePresence>
              {visible.map((task, idx) => (
                <div key={task._id}>
                  {idx === nowIndex && <NowMarker />}
                  <TaskItem task={task} index={idx} onStatus={handleStatus} onEdit={openEdit} onDelete={handleDelete} />
                </div>
              ))}
              {nowIndex === visible.length && isToday && <NowMarker key="now-end" />}
            </AnimatePresence>
          )}
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTask ? "Edit item" : "Add to My Day"}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editTask ? "Save Changes" : "Add"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Title *" placeholder="e.g. Team planning meeting" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Date *" type="date" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} error={errors.date} />
            <Input label="Time *" type="time" value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} error={errors.time} />
            <Input label="Duration (min)" type="number" min="0" placeholder="45" value={form.durationMin}
              onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))} />
          </div>
          <Textarea label="Notes" placeholder="Location, details…" rows={3} maxLength={300}
            value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </form>
      </Modal>
    </div>
  );
};

export default MyDay;
