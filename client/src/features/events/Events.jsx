import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Calendar, Trash2, Edit3, MapPin, Clock, CheckCircle2, Bell, BellOff } from "lucide-react";
import dayjs from "dayjs";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import DescriptionText from "../../components/ui/DescriptionText";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../services/api/eventsService";
import { STATUS_COLORS, PRIORITY_COLORS } from "../../constants";
import { formatDate } from "../../utils";
import styles from "./Events.module.css";

const EMPTY_FORM = {
  title: "", description: "", startDate: "", endDate: "",
  location: "", priority: "medium", status: "upcoming", reminder: "none",
};

const EventCard = ({ event, onEdit, onDelete, onComplete }) => {
  const sc = STATUS_COLORS[event.status]   || STATUS_COLORS.upcoming;
  const pc = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.medium;
  const isPast = dayjs(event.startDate).isBefore(dayjs());
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[styles.eventCard, isPast && event.status === "upcoming" ? styles.overdue : ""].join(" ")}
    >
      <div className={styles.eventDateBadge}>
        <span className={styles.eventDay}>{dayjs(event.startDate).format("DD")}</span>
        <span className={styles.eventMonth}>{dayjs(event.startDate).format("MMM")}</span>
      </div>

      <div className={styles.eventBody}>
        <div className={styles.eventHeader}>
          <span className={styles.eventTitle}>{event.title}</span>
          <Badge bg={sc.bg} color={sc.text} dot>{sc.label}</Badge>
        </div>
        {event.description && (
          <DescriptionText
            text={event.description}
            maxChars={140}
            className={styles.eventDesc}
          />
        )}
        <div className={styles.eventMeta}>
          <span className={styles.metaItem}><Clock size={11} />{formatDate(event.startDate, "h:mm A")}</span>
          {event.location && <span className={styles.metaItem}><MapPin size={11} />{event.location}</span>}
          <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
        </div>
      </div>

      <div className={styles.eventActions}>
        {event.status === "upcoming" && (
          <button className={styles.actionBtn} onClick={() => onComplete(event)} title="Mark complete">
            <CheckCircle2 size={15} />
          </button>
        )}
        <button className={styles.actionBtn} onClick={() => onEdit(event)} title="Edit">
          <Edit3 size={15} />
        </button>
        <button className={[styles.actionBtn, styles.danger].join(" ")} onClick={() => onDelete(event._id)} title="Delete">
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [modal, setModal]       = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  // ── Notification permission state ──────────────────────────────────────
  const [notifPerm, setNotifPerm] = useState(
    "Notification" in window ? Notification.permission : "denied"
  );

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted") toast.success("Reminders enabled — you'll be notified before events.");
    else toast.error("Permission denied. Reminders won't fire.");
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter) params.status = filter;
      const res = await getEvents(params);
      setEvents(res.data?.data?.events ?? []);
    } catch { toast.error("Failed to load events"); }
    finally  { setLoading(false); }
  }, [filter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const openCreate = () => {
    setEditEvent(null);
    setForm({ ...EMPTY_FORM, startDate: dayjs().format("YYYY-MM-DDTHH:mm") });
    setErrors({});
    setModal(true);
  };
  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({
      title: ev.title, description: ev.description || "",
      startDate: dayjs(ev.startDate).format("YYYY-MM-DDTHH:mm"),
      endDate: ev.endDate ? dayjs(ev.endDate).format("YYYY-MM-DDTHH:mm") : "",
      location: ev.location || "", priority: ev.priority, status: ev.status, reminder: ev.reminder || "none",
    });
    setErrors({});
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.startDate)    errs.startDate = "Start date is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (editEvent) {
        const res = await updateEvent(editEvent._id, form);
        setEvents((ev) => ev.map((x) => x._id === editEvent._id ? res.data.data.event : x));
        toast.success("Event updated");
      } else {
        const res = await createEvent(form);
        setEvents((ev) => [res.data.data.event, ...ev]);
        toast.success("Event created");
      }
      setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents((ev) => ev.filter((x) => x._id !== id));
      toast.success("Event deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handleComplete = async (ev) => {
    try {
      const res = await updateEvent(ev._id, { status: "completed" });
      setEvents((evs) => evs.map((x) => x._id === ev._id ? res.data.data.event : x));
      toast.success("Marked as completed");
    } catch { toast.error("Failed to update"); }
  };

  // Group events by date
  const grouped = events.reduce((acc, ev) => {
    const d = dayjs(ev.startDate).format("YYYY-MM-DD");
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className={styles.page}>
      <Topbar
        title="Events"
        actions={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Event</Button>}
      />

      <div className={styles.content}>
        {/* Notification permission banner */}
        <AnimatePresence>
          {notifPerm === "default" && (
            <motion.div
              className={styles.notifBanner}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Bell size={15} />
              <span>Enable browser notifications to receive event reminders.</span>
              <button className={styles.notifAllow} onClick={requestNotifPermission}>
                Allow
              </button>
              <button className={styles.notifDismiss} onClick={() => setNotifPerm("denied")}>
                <BellOff size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <div className={styles.toolbar}>
          {["", "upcoming", "in_progress", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className={[styles.filterChip, filter === s ? styles.activeChip : ""].join(" ")}
              onClick={() => setFilter(s)}
            >
              {s ? (STATUS_COLORS[s]?.label ?? s) : "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.skeletonList}>
            {[1,2,3,4].map((i) => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar size={22} /></div>
            <h3>No events found</h3>
            <p>Schedule your first event to stay on top of your tasks.</p>
            <Button onClick={openCreate} icon={<Plus size={14} />}>New Event</Button>
          </div>
        ) : (
          <div className={styles.eventGroups}>
            {sortedDates.map((date) => (
              <div key={date} className={styles.eventGroup}>
                <div className={styles.groupDate}>
                  <span className={styles.groupDateText}>
                    {dayjs(date).isSame(dayjs(), "day")
                      ? "Today"
                      : dayjs(date).isSame(dayjs().add(1, "day"), "day")
                      ? "Tomorrow"
                      : dayjs(date).format("dddd, MMMM D")}
                  </span>
                  <div className={styles.groupLine} />
                </div>
                <AnimatePresence>
                  {grouped[date].map((ev) => (
                    <EventCard
                      key={ev._id}
                      event={ev}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onComplete={handleComplete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editEvent ? "Edit Event" : "New Event"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editEvent ? "Save Changes" : "Create Event"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Title *" placeholder="Event title" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Input label="Start Date & Time *" type="datetime-local" value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} error={errors.startDate} />
            <Input label="End Date & Time" type="datetime-local" value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <Input label="Location" placeholder="Add location" value={form.location}
            icon={<MapPin size={14} />}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Textarea label="Description" placeholder="Describe this event…" rows={3} value={form.description}
            maxLength={500}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Priority" value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Select label="Status" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select label="Reminder" value={form.reminder}
              onChange={(e) => setForm((f) => ({ ...f, reminder: e.target.value }))}>
              <option value="none">None</option>
              <option value="at_time">At time</option>
              <option value="5min">5 min before</option>
              <option value="15min">15 min before</option>
              <option value="30min">30 min before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
