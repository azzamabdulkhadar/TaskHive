import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  StickyNote, CalendarDays, Users, Plus,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Topbar from "../../components/layout/Topbar";
import Badge from "../../components/ui/Badge";
import { getNotes }    from "../../services/api/notesService";
import { getEvents }   from "../../services/api/eventsService";
import { getLeads }    from "../../services/api/leadsService";
import { getActivity } from "../../services/api/activityService";
import { greetingByHour, formatDate, fromNow, dayjs } from "../../utils";
import { STATUS_COLORS, PRIORITY_COLORS } from "../../constants";
import styles from "./Dashboard.module.css";

const ENTITY_ICON  = { note: StickyNote, event: CalendarDays, lead: Users, auth: TrendingUp, file: StickyNote };
const ACTION_COLOR = {
  CREATE: "var(--color-success)", UPDATE: "var(--color-info)",
  DELETE: "var(--color-danger)", STATUS_CHANGE: "var(--color-warning)",
  LOGIN: "var(--color-primary)", LOGOUT: "var(--color-text-muted)", UPLOAD: "var(--color-info)",
};

// ── Lead status pipeline order + chart colours ─────────────────────────────
const PIPELINE_STAGES = [
  { key: "new",         label: "New",         color: "#3b82f6" },
  { key: "contacted",   label: "Contacted",   color: "#8b5cf6" },
  { key: "qualified",   label: "Qualified",   color: "#f59e0b" },
  { key: "proposal",    label: "Proposal",    color: "#ec4899" },
  { key: "negotiation", label: "Negotiation", color: "#a855f7" },
  { key: "won",         label: "Won",         color: "#22c55e" },
  { key: "lost",        label: "Lost",        color: "#ef4444" },
];

const PRIORITY_PIE_COLORS = {
  low:    "#3b82f6",
  medium: "#f59e0b",
  high:   "#ef4444",
  urgent: "#db2777",
};

// Custom tooltip for bar chart
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{label}</span>
      <span className={styles.chartTooltipVal}>{payload[0].value} leads</span>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{payload[0].name}</span>
      <span className={styles.chartTooltipVal}>{payload[0].value} leads</span>
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Link to={to} className={styles.statCard} style={{ "--accent": color }}>
      <div className={styles.statIcon}><Icon size={20} /></div>
      <div>
        <div className={styles.statValue}>{value ?? "—"}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </Link>
  </motion.div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  const user = useSelector((s) => s.session.user);
  const [stats, setStats]               = useState({ notes: 0, events: 0, leads: 0, activeLeads: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allLeads, setAllLeads]         = useState([]);
  const [activityData, setActivityData] = useState([]); // last-7-days activity counts
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [notesRes, eventsRes, leadsRes, actRes, activeLeadsRes] = await Promise.all([
          getNotes({ limit: 1 }),
          getEvents({ status: "upcoming", limit: 5 }),
          getLeads({ limit: 200 }),           // fetch all for chart data
          getActivity({ limit: 50 }),          // more for the 7-day bar chart
          getLeads({ status: "new", limit: 1 }),
        ]);

        const leads   = leadsRes.data?.data?.leads   ?? [];
        const activity = actRes.data?.data?.activity ?? [];

        setStats({
          notes:       notesRes.data?.data?.total      ?? 0,
          events:      eventsRes.data?.data?.total     ?? 0,
          leads:       leadsRes.data?.data?.total      ?? leads.length,
          activeLeads: activeLeadsRes.data?.data?.total ?? 0,
        });
        setUpcomingEvents(eventsRes.data?.data?.events ?? []);
        setRecentActivity(activity.slice(0, 10));
        setAllLeads(leads);

        // Build last-7-days activity bar chart data
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = dayjs().subtract(6 - i, "day");
          return { date: d.format("YYYY-MM-DD"), label: d.format("ddd"), count: 0 };
        });
        activity.forEach((a) => {
          const d = dayjs(a.createdAt).format("YYYY-MM-DD");
          const slot = days.find((s) => s.date === d);
          if (slot) slot.count += 1;
        });
        setActivityData(days);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived chart data ────────────────────────────────────────────────────
  const pipelineData = PIPELINE_STAGES.map((s) => ({
    ...s,
    value: allLeads.filter((l) => l.status === s.key).length,
  })).filter((s) => s.value > 0);

  const priorityCounts = ["low", "medium", "high", "urgent"].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: allLeads.filter((l) => l.priority === p).length,
    color: PRIORITY_PIE_COLORS[p],
  })).filter((p) => p.value > 0);

  return (
    <div className={styles.page}>
      <Topbar title="Dashboard" />

      <div className={styles.content}>
        {/* Greeting */}
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h2 className={styles.greetingText}>{greetingByHour(user?.name)} 👋</h2>
            <p className={styles.greetingSub}>Here's what's happening in your workspace today.</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard icon={StickyNote}   label="Total Notes"     value={loading ? "…" : stats.notes}       color="var(--color-primary)" to="/app/notes"   delay={0.05} />
          <StatCard icon={CalendarDays} label="Upcoming Events" value={loading ? "…" : stats.events}      color="var(--color-info)"    to="/app/events"  delay={0.1}  />
          <StatCard icon={Users}        label="Total Leads"     value={loading ? "…" : stats.leads}       color="var(--color-success)" to="/app/leads"   delay={0.15} />
          <StatCard icon={AlertCircle}  label="New Leads"       value={loading ? "…" : stats.activeLeads} color="var(--color-warning)" to="/app/leads"   delay={0.2}  />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className={styles.chartsRow}>
          {/* Lead Pipeline Bar */}
          <motion.div
            className={["card", styles.chartCard].join(" ")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}><Users size={16} /> Lead Pipeline</h3>
              <Link to="/app/leads" className={styles.seeAll}>See all →</Link>
            </div>
            {loading ? (
              <div className={styles.chartSkeleton}><div className="skeleton" style={{ height: "100%", borderRadius: "var(--radius-lg)" }} /></div>
            ) : pipelineData.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-6) 0" }}>
                <div className="empty-state-icon"><Users size={20} /></div>
                <p>No leads yet</p>
              </div>
            ) : (
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pipelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--color-bg-secondary)" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Lead Priority Pie */}
          <motion.div
            className={["card", styles.chartCard].join(" ")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}><AlertCircle size={16} /> Leads by Priority</h3>
            </div>
            {loading ? (
              <div className={styles.chartSkeleton}><div className="skeleton" style={{ height: "100%", borderRadius: "var(--radius-lg)" }} /></div>
            ) : priorityCounts.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-6) 0" }}>
                <div className="empty-state-icon"><AlertCircle size={20} /></div>
                <p>No leads yet</p>
              </div>
            ) : (
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={priorityCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {priorityCounts.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                      iconSize={8}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* 7-day Activity Bar */}
          <motion.div
            className={["card", styles.chartCard].join(" ")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}><Activity size={16} /> Activity (7 days)</h3>
              <Link to="/app/activity" className={styles.seeAll}>View log →</Link>
            </div>
            {loading ? (
              <div className={styles.chartSkeleton}><div className="skeleton" style={{ height: "100%", borderRadius: "var(--radius-lg)" }} /></div>
            ) : (
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className={styles.chartTooltip}>
                            <span className={styles.chartTooltipLabel}>{label}</span>
                            <span className={styles.chartTooltipVal}>{payload[0].value} actions</span>
                          </div>
                        ) : null
                      }
                      cursor={{ fill: "var(--color-bg-secondary)" }}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Events + Activity ───────────────────────────────────────────── */}
        <div className={styles.twoCol}>
          {/* Upcoming Events */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.33, duration: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}><CalendarDays size={16} /> Upcoming Events</h3>
              <Link to="/app/events" className={styles.seeAll}>See all →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonList}>
                {[1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-8) var(--space-4)" }}>
                <div className="empty-state-icon"><CalendarDays size={22} /></div>
                <p>No upcoming events</p>
                <Link to="/app/events"><small style={{ color: "var(--color-primary)" }}>+ Add an event</small></Link>
              </div>
            ) : (
              <div className={styles.eventList}>
                {upcomingEvents.map((ev) => {
                  const sc = STATUS_COLORS[ev.status]     || STATUS_COLORS.upcoming;
                  const pc = PRIORITY_COLORS[ev.priority] || PRIORITY_COLORS.medium;
                  return (
                    <div key={ev._id} className={styles.eventItem}>
                      <div className={styles.eventDot} style={{ background: sc.text }} />
                      <div className={styles.eventBody}>
                        <span className={styles.eventTitle}>{ev.title}</span>
                        <span className={styles.eventDate}>
                          <Clock size={11} /> {formatDate(ev.startDate, "MMM D · h:mm A")}
                        </span>
                      </div>
                      <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38, duration: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}><TrendingUp size={16} /> Recent Activity</h3>
              <Link to="/app/activity" className={styles.seeAll}>See all →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonList}>
                {[1, 2, 3, 4].map((i) => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-8) var(--space-4)" }}>
                <div className="empty-state-icon"><TrendingUp size={22} /></div>
                <p>No activity yet</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {recentActivity.map((a) => {
                  const Icon = ENTITY_ICON[a.entityType] || CheckCircle2;
                  return (
                    <div key={a._id} className={styles.activityItem}>
                      <div
                        className={styles.activityIcon}
                        style={{ background: `${ACTION_COLOR[a.action]}18`, color: ACTION_COLOR[a.action] }}
                      >
                        <Icon size={13} />
                      </div>
                      <div className={styles.activityBody}>
                        <span className={styles.activityTitle}>
                          {a.action} {a.entityType}
                          {a.entityTitle ? ` — ${a.entityTitle}` : ""}
                        </span>
                        <span className={styles.activityTime}>{fromNow(a.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className={styles.quickActions}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.3 }}
        >
          <h3 className={styles.sectionTitle} style={{ marginBottom: "var(--space-3)" }}>Quick Create</h3>
          <div className={styles.quickGrid}>
            {[
              { label: "New Note",  icon: StickyNote,   to: "/app/notes",  color: "var(--color-primary)" },
              { label: "New Event", icon: CalendarDays, to: "/app/events", color: "var(--color-info)"    },
              { label: "New Lead",  icon: Users,        to: "/app/leads",  color: "var(--color-success)" },
            ].map(({ label, icon: Icon, to, color }) => (
              <Link key={to} to={to} className={styles.quickCard} style={{ "--qa": color }}>
                <Plus size={14} />
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
