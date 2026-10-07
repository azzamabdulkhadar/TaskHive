import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, Search, X, StickyNote, CalendarDays, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { getInitials, fromNow, debounce } from "../../utils";
import { getNotes }  from "../../services/api/notesService";
import { getEvents } from "../../services/api/eventsService";
import { getLeads }  from "../../services/api/leadsService";
import styles from "./Topbar.module.css";

/* ─── Notification Panel ─────────────────────────────────── */
// Initial notification data — defined once at module level (immutable seed only)
const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "Welcome to TaskHive!", time: new Date(Date.now() - 1000 * 60 * 2),  read: false },
  { id: 2, text: "Start by creating your first note or event.", time: new Date(Date.now() - 1000 * 60 * 30), read: true },
];

// Panel receives items + setters from the parent so the badge stays in sync
const NotificationPanel = ({ items, onMarkOne, onMarkAll }) => {
  const unread = items.filter((n) => !n.read).length;

  return (
    <motion.div
      className={styles.panel}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Notifications</span>
        {unread > 0 && (
          <button className={styles.panelAction} onClick={onMarkAll}>Mark all read</button>
        )}
      </div>
      <div className={styles.panelBody}>
        {items.length === 0 ? (
          <div className={styles.panelEmpty}>No notifications</div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={[styles.notifItem, !n.read ? styles.unread : ""].join(" ")}
              onClick={() => onMarkOne(n.id)}
            >
              <div className={styles.notifDot} />
              <div className={styles.notifBody}>
                <p className={styles.notifText}>{n.text}</p>
                <span className={styles.notifTime}><Clock size={10} />{fromNow(n.time)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

/* ─── Search Panel ───────────────────────────────────────── */
const ENTITY_ICONS = { note: StickyNote, event: CalendarDays, lead: Users };
const ENTITY_ROUTES = { note: "/app/notes", event: "/app/events", lead: "/app/leads" };

const SearchPanel = ({ onClose }) => {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const runSearch = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setResults([]); setLoading(false); return; }
      setLoading(true);
      try {
        const [notesRes, eventsRes, leadsRes] = await Promise.all([
          getNotes({ search: q, limit: 5 }),
          getEvents({ limit: 5 }),
          getLeads({ search: q, limit: 5 }),
        ]);
        const notes  = (notesRes.data?.data?.notes  ?? []).map((n) => ({ ...n, _type: "note",  label: n.title }));
        const events = (eventsRes.data?.data?.events ?? [])
          .filter((e) => e.title.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5)
          .map((e) => ({ ...e, _type: "event", label: e.title }));
        const leads  = (leadsRes.data?.data?.leads  ?? []).map((l) => ({ ...l, _type: "lead",  label: l.name }));
        setResults([...notes, ...events, ...leads]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.trim()) { setLoading(true); runSearch(q); }
    else { setResults([]); setLoading(false); }
  };

  const handleSelect = (item) => {
    navigate(ENTITY_ROUTES[item._type]);
    onClose();
  };

  return (
    <motion.div
      className={styles.searchPanel}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      {/* Search input */}
      <div className={styles.searchInputRow}>
        <Search size={16} className={styles.searchIcon} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="Search notes, events, leads…"
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button className={styles.searchClear} onClick={() => { setQuery(""); setResults([]); }}>
            <X size={14} />
          </button>
        )}
        <kbd className={styles.kbdEsc} onClick={onClose}>Esc</kbd>
      </div>

      {/* Results */}
      <div className={styles.searchResults}>
        {loading && (
          <div className={styles.searchLoading}>
            {[1,2,3].map((i) => <div key={i} className={`skeleton ${styles.resultSkeleton}`} />)}
          </div>
        )}
        {!loading && query && results.length === 0 && (
          <div className={styles.searchEmpty}>No results for &ldquo;{query}&rdquo;</div>
        )}
        {!loading && results.map((item) => {
          const Icon = ENTITY_ICONS[item._type];
          return (
            <button key={item._id} className={styles.resultItem} onClick={() => handleSelect(item)}>
              <div className={[styles.resultIcon, styles[`resultIcon_${item._type}`]].join(" ")}>
                <Icon size={14} />
              </div>
              <div className={styles.resultBody}>
                <span className={styles.resultLabel}>{item.label}</span>
                <span className={styles.resultType}>{item._type}</span>
              </div>
            </button>
          );
        })}
        {!query && (
          <div className={styles.searchHint}>
            <Search size={28} className={styles.searchHintIcon} />
            <p>Search across notes, events, and leads</p>
            <span>Type anything to get started</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Topbar ─────────────────────────────────────────────── */
const Topbar = ({ title, actions }) => {
  const dispatch = useDispatch();
  const mode     = useSelector((s) => s.theme.mode);
  const user     = useSelector((s) => s.session.user);

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  // Notifications state lives here so badge + panel stay in sync
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markOne = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Close panels when clicking outside
  const topbarRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target)) {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ctrl/Cmd+K opens search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
        setNotifOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleSearch = () => { setSearchOpen((o) => !o); setNotifOpen(false); };
  const toggleNotif  = () => { setNotifOpen((o) => !o);  setSearchOpen(false); };

  return (
    <header className={styles.topbar} ref={topbarRef}>
      {/* Left: page title */}
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      {/* Right: controls */}
      <div className={styles.right}>
        {/* Search */}
        <button
          className={[styles.iconBtn, searchOpen ? styles.iconBtnActive : ""].join(" ")}
          onClick={toggleSearch}
          title="Search (Ctrl+K)"
          aria-expanded={searchOpen}
        >
          <Search size={17} />
        </button>

        {/* Theme toggle */}
        <button
          className={styles.iconBtn}
          onClick={() => dispatch(toggleTheme())}
          title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {mode === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Notifications */}
        <button
          className={[styles.iconBtn, notifOpen ? styles.iconBtnActive : ""].join(" ")}
          onClick={toggleNotif}
          title="Notifications"
          aria-expanded={notifOpen}
          style={{ position: "relative" }}
        >
          <Bell size={17} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>

        {/* Custom action buttons */}
        {actions}

        {/* User avatar */}
        <div className={styles.userAvatar} title={user?.name}>
          {getInitials(user?.name)}
        </div>
      </div>

      {/* Dropdowns — rendered inside topbar so they stay in the ref boundary */}
      <AnimatePresence>
        {searchOpen && (
          <div className={styles.searchOverlay}>
            <SearchPanel onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifOpen && (
          <div className={styles.notifOverlay}>
            <NotificationPanel
              items={notifications}
              onMarkOne={markOne}
              onMarkAll={markAll}
            />
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;
