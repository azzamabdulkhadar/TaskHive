import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, StickyNote, CalendarDays, Users,
  Settings, LogOut, ChevronLeft, ChevronRight, Zap, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutSuccess } from "../../redux/slices/sessionSlice";
import { getInitials } from "../../utils";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
  { label: "Notes",     icon: StickyNote,      to: "/app/notes"     },
  { label: "Events",    icon: CalendarDays,    to: "/app/events"    },
  { label: "Leads",     icon: Users,           to: "/app/leads"     },
  { label: "Activity",  icon: Activity,        to: "/app/activity"  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.session.user);

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
  };

  return (
    <motion.aside
      className={styles.sidebar}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
    >
      {/* Collapse toggle — sits on the right edge, always visible */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={18} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              className={styles.logoText}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              TaskHive
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app/leads"}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ""].join(" ")
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className={styles.navIcon} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className={styles.navLabel}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={styles.bottom}>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [styles.navItem, isActive ? styles.active : ""].join(" ")
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className={styles.navIcon} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className={styles.navLabel}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <div className={styles.userRow}>
          <div className={styles.avatar}>{getInitials(user?.name)}</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className={styles.userInfo}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
              >
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
