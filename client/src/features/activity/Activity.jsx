import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity as ActivityIcon, StickyNote, CalendarDays, Users,
  TrendingUp, Clock, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, Trash2, RefreshCw, LogIn, LogOut, Upload,
} from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import { getActivity } from "../../services/api/activityService";
import { fromNow, formatDate } from "../../utils";
import styles from "./Activity.module.css";

/* ── Constants ──────────────────────────────────────────────── */
const ENTITY_ICON = {
  note:  StickyNote,
  event: CalendarDays,
  lead:  Users,
  auth:  TrendingUp,
  file:  Upload,
};
const ENTITY_ROUTE = {
  note:  "/app/notes",
  event: "/app/events",
  lead:  "/app/leads",
};

const ACTION_META = {
  CREATE:        { label: "Created",        color: "var(--color-success)", icon: CheckCircle2 },
  UPDATE:        { label: "Updated",        color: "var(--color-info)",    icon: RefreshCw    },
  DELETE:        { label: "Deleted",        color: "var(--color-danger)",  icon: Trash2       },
  STATUS_CHANGE: { label: "Status changed", color: "var(--color-warning)", icon: RefreshCw    },
  LOGIN:         { label: "Logged in",      color: "var(--color-primary)", icon: LogIn        },
  LOGOUT:        { label: "Logged out",     color: "var(--color-text-muted)", icon: LogOut    },
  UPLOAD:        { label: "File uploaded",  color: "var(--color-info)",    icon: Upload       },
};

const ENTITY_TYPES = ["note", "event", "lead", "auth", "file"];
const ACTIONS      = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN", "LOGOUT", "UPLOAD"];
const PAGE_SIZE    = 20;

/* ── Activity row ───────────────────────────────────────────── */
const ActivityRow = ({ item, idx }) => {
  const EntityIcon = ENTITY_ICON[item.entityType] || CheckCircle2;
  const meta       = ACTION_META[item.action]     || ACTION_META.UPDATE;
  const ActionIcon = meta.icon;
  const route      = ENTITY_ROUTE[item.entityType];

  return (
    <motion.div
      className={styles.row}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: idx * 0.025, duration: 0.18 }}
    >
      {/* Entity icon */}
      <div
        className={styles.entityIcon}
        style={{ background: `${meta.color}14`, color: meta.color }}
        title={item.entityType}
      >
        <EntityIcon size={15} />
      </div>

      {/* Main content */}
      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          {/* Action badge */}
          <Badge
            bg={`${meta.color}14`}
            color={meta.color}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <ActionIcon size={10} />
            {meta.label}
          </Badge>

          {/* Entity type chip */}
          <span className={styles.entityChip}>{item.entityType}</span>

          {/* Entity title / link */}
          {item.entityTitle && (
            route ? (
              <Link to={route} className={styles.entityLink}>
                {item.entityTitle}
              </Link>
            ) : (
              <span className={styles.entityTitle}>{item.entityTitle}</span>
            )
          )}

          {/* Status change detail */}
          {item.metadata?.from && item.metadata?.to && (
            <span className={styles.statusChange}>
              <span className={styles.statusFrom}>{item.metadata.from}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.statusTo}>{item.metadata.to}</span>
            </span>
          )}
        </div>

        <div className={styles.rowMeta}>
          <Clock size={10} />
          <span title={formatDate(item.createdAt, "MMM D, YYYY h:mm A")}>
            {fromNow(item.createdAt)}
          </span>
          <span className={styles.dot}>·</span>
          <span>{formatDate(item.createdAt, "MMM D, YYYY")}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Activity page ──────────────────────────────────────────── */
const Activity = () => {
  const [items, setItems]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res  = await getActivity({ page: p, limit: PAGE_SIZE });
      const data = res.data?.data ?? {};
      let activity = data.activity ?? [];

      // Client-side filters (backend doesn't support them yet)
      if (filterEntity) activity = activity.filter((a) => a.entityType === filterEntity);
      if (filterAction) activity = activity.filter((a) => a.action      === filterAction);

      setItems(activity);
      // Use real total only when no filters are active so pagination stays accurate
      setTotal(filterEntity || filterAction ? activity.length : (data.total ?? activity.length));
    } catch {
      toast.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [filterEntity, filterAction]);

  useEffect(() => { setPage(1); load(1); }, [load]);

  const handlePage = (p) => {
    setPage(p);
    load(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group items by date for visual separation
  const grouped = items.reduce((acc, item) => {
    const day = formatDate(item.createdAt, "YYYY-MM-DD");
    if (!acc[day]) acc[day] = { label: formatDate(item.createdAt, "dddd, MMMM D"), items: [] };
    acc[day].items.push(item);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className={styles.page}>
      <Topbar title="Activity Log" />

      <div className={styles.content}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Filter size={15} className={styles.filterIcon} />
            <Select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="">All entities</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="">All actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{ACTION_META[a]?.label ?? a}</option>
              ))}
            </Select>
          </div>
          {total > 0 && (
            <span className={styles.totalBadge}>{total} events</span>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ActivityIcon size={24} /></div>
            <h3>No activity yet</h3>
            <p>Every create, update, and delete across leads, notes, and events appears here.</p>
          </div>
        ) : (
          <div className={styles.groups}>
            <AnimatePresence mode="wait">
              {groupKeys.map((day) => (
                <div key={day} className={styles.group}>
                  {/* Date separator */}
                  <div className={styles.dateSep}>
                    <span className={styles.dateSepLabel}>{grouped[day].label}</span>
                    <div className={styles.dateSepLine} />
                  </div>
                  {/* Rows */}
                  <div className={styles.groupItems}>
                    {grouped[day].items.map((item, idx) => (
                      <ActivityRow key={item._id} item={item} idx={idx} />
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && !(filterEntity || filterAction) && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
                ) : (
                  <button
                    key={p}
                    className={[styles.pageBtn, p === page ? styles.pageActive : ""].join(" ")}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              className={styles.pageBtn}
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
