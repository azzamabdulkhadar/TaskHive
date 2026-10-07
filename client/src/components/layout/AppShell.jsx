import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useEventReminders from "../../hooks/useEventReminders";
import styles from "./AppShell.module.css";

const AppShell = () => {
  // Start the reminder scheduler for the lifetime of the authenticated session
  useEventReminders();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;
