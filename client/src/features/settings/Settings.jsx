import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { User, Lock, Palette, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { updateMe, changePassword } from "../../services/api/authService";
import { updateUser, logoutSuccess } from "../../redux/slices/sessionSlice";
import { setTheme } from "../../redux/slices/themeSlice";
import styles from "./Settings.module.css";

const Settings = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector((s) => s.session.user);
  const themeMode  = useSelector((s) => s.theme.mode);

  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "", gender: user?.gender || "" });
  const [pwForm,  setPwForm]  = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateMe(profile);
      dispatch(updateUser(res.data.data.user));
      toast.success("Profile updated");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (pwForm.newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed to change password"); }
    finally { setSavingPw(false); }
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <Topbar title="Settings" />
      <div className={styles.content}>
        {/* Profile */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={18} />
            <h3 className={styles.sectionTitle}>Profile</h3>
          </div>
          <form className={styles.form} onSubmit={handleProfileSave}>
            <div className={styles.grid2}>
              <Input label="Full Name" value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              <Input label="Phone" type="tel" value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className={styles.grid2}>
              <Input label="Email" value={user?.email || ""} disabled />
              <Select label="Gender" value={profile.gender}
                onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </Select>
            </div>
            <div>
              <Button type="submit" loading={savingProfile}>Save Profile</Button>
            </div>
          </form>
        </section>

        {/* Theme */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Palette size={18} />
            <h3 className={styles.sectionTitle}>Appearance</h3>
          </div>
          <div className={styles.themeRow}>
            {["light","dark"].map((m) => (
              <button
                key={m}
                className={[styles.themeBtn, themeMode === m ? styles.themeBtnActive : ""].join(" ")}
                onClick={() => dispatch(setTheme(m))}
              >
                <span className={styles.themePreview} data-mode={m} />
                <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Password */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={18} />
            <h3 className={styles.sectionTitle}>Change Password</h3>
          </div>
          <form className={styles.form} onSubmit={handlePasswordSave}>
            <Input label="Current Password" type="password" value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
            <div className={styles.grid2}>
              <Input label="New Password" type="password" value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} />
              <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            <div>
              <Button type="submit" loading={savingPw}>Change Password</Button>
            </div>
          </form>
        </section>

        {/* Danger zone */}
        <section className={styles.section} style={{ borderColor: "var(--color-danger)" }}>
          <div className={styles.sectionHeader}>
            <LogOut size={18} style={{ color: "var(--color-danger)" }} />
            <h3 className={styles.sectionTitle} style={{ color: "var(--color-danger)" }}>Sign Out</h3>
          </div>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
            You'll be redirected to the login page.
          </p>
          <Button variant="danger" onClick={handleLogout} icon={<LogOut size={14} />}>Sign Out</Button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
