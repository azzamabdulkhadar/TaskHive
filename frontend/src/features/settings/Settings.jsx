import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { User, Lock, Palette, LogOut, Sun, Moon, Check, Eye, EyeOff, Mail, Phone, CalendarDays, Camera, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { updateMe, changePassword } from "../../services/api/authService";
import { updateUser, logoutSuccess } from "../../redux/slices/sessionSlice";
import { setTheme } from "../../redux/slices/themeSlice";
import Avatar from "../../components/ui/Avatar";
import AvatarCropper from "../../components/ui/AvatarCropper";
import { uploadFile } from "../../services/api/uploadService";
import styles from "./Settings.module.css";

const TABS = [
  { key: "profile",    label: "Profile",    icon: User },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "security",   label: "Security",   icon: Lock },
];

const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};
const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];

const Settings = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.session.user);
  const themeMode = useSelector((s) => s.theme.mode);

  const [tab, setTab] = useState("profile");

  // Profile picture
  const photoInput = useRef(null);
  const [cropFile, setCropFile] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
    setCropFile(f);
  };

  const savePhoto = async (blob) => {
    setSavingPhoto(true);
    try {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      const up = await uploadFile(file);
      if (!up?.url) throw new Error("no url");
      const res = await updateMe({ avatar: up.url });
      dispatch(updateUser(res.data.data.user));
      toast.success("Profile picture updated");
      setCropFile(null);
    } catch {
      toast.error("Could not upload the picture");
    } finally {
      setSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    try {
      const res = await updateMe({ avatar: "" });
      dispatch(updateUser(res.data.data.user));
      toast.success("Profile picture removed");
    } catch {
      toast.error("Could not remove the picture");
    }
  };

  const initialProfile = useMemo(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    dob: user?.dob ? dayjs(user.dob).format("YYYY-MM-DD") : "",
  }), [user]);
  const [profile, setProfile] = useState(initialProfile);
  const profileDirty = JSON.stringify(profile) !== JSON.stringify(initialProfile);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const strength = passwordStrength(pwForm.newPassword);
  const mismatch = pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name is required"); return; }
    setSavingProfile(true);
    try {
      const payload = { ...profile, name: profile.name.trim() };
      if (!payload.dob) delete payload.dob;
      if (!payload.gender) delete payload.gender;
      const res = await updateMe(payload);
      dispatch(updateUser(res.data.data.user));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <Topbar title="Settings" />
      <div className={styles.content}>
        {/* Profile header */}
        <div className={styles.hero}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}><Avatar user={user} /></div>
            <button type="button" className={styles.camBtn} onClick={() => photoInput.current?.click()} title="Change profile picture">
              <Camera size={14} />
            </button>
            <input ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pickPhoto} />
          </div>
          <div className={styles.heroInfo}>
            <h2 className={styles.heroName}>{user?.name}</h2>
            <div className={styles.heroMeta}>
              {user?.email && <span><Mail size={13} /> {user.email}</span>}
              {user?.phone && <span><Phone size={13} /> {user.phone}</span>}
              {user?.createdAt && <span><CalendarDays size={13} /> Joined {dayjs(user.createdAt).format("MMM YYYY")}</span>}
            </div>
          </div>
          {user?.avatar && (
            <Button variant="secondary" size="sm" onClick={removePhoto} icon={<Trash2 size={14} />}>Remove photo</Button>
          )}
          <Button variant="danger" size="sm" onClick={handleLogout} icon={<LogOut size={14} />}>Sign out</Button>
        </div>

        <div className={styles.layout}>
          {/* Side tabs */}
          <nav className={styles.tabs} role="tablist">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                className={[styles.tab, tab === key ? styles.tabActive : ""].join(" ")}
                onClick={() => setTab(key)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>

          <div className={styles.panel}>
            {tab === "profile" && (
              <form onSubmit={handleProfileSave} className={styles.form}>
                <div className={styles.panelHead}>
                  <h3>Profile</h3>
                  <p>Your personal details.</p>
                </div>
                <div className={styles.grid2}>
                  <Input label="Full name" value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                  <Input label="Phone" type="tel" value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className={styles.grid2}>
                  <Input label="Email" value={user?.email || ""} disabled hint="Email can't be changed." />
                  <Input label="Date of birth" type="date" value={profile.dob}
                    onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))} />
                </div>
                <div className={styles.grid2}>
                  <Select label="Gender" value={profile.gender}
                    onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </Select>
                </div>
                <div className={styles.actions}>
                  <Button type="submit" loading={savingProfile} disabled={!profileDirty}>Save changes</Button>
                  {profileDirty && (
                    <Button type="button" variant="secondary" onClick={() => setProfile(initialProfile)}>Reset</Button>
                  )}
                </div>
              </form>
            )}

            {tab === "appearance" && (
              <div className={styles.form}>
                <div className={styles.panelHead}>
                  <h3>Appearance</h3>
                  <p>Choose how TaskHive looks. The change applies immediately.</p>
                </div>
                <div className={styles.themeGrid}>
                  {[{ m: "light", icon: Sun, label: "Light" }, { m: "dark", icon: Moon, label: "Dark" }].map(({ m, icon: Icon, label }) => (
                    <button
                      key={m}
                      type="button"
                      className={[styles.themeCard, themeMode === m ? styles.themeActive : ""].join(" ")}
                      onClick={() => dispatch(setTheme(m))}
                    >
                      <span className={styles.themePreview} data-mode={m}>
                        <i /><i /><i />
                      </span>
                      <span className={styles.themeLabel}><Icon size={14} /> {label}</span>
                      {themeMode === m && <span className={styles.themeCheck}><Check size={12} /></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "security" && (
              <form onSubmit={handlePasswordSave} className={styles.form}>
                <div className={styles.panelHead}>
                  <h3>Security</h3>
                  <p>Change your password. Use at least 6 characters.</p>
                </div>
                <Input
                  label="Current password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <div className={styles.grid2}>
                  <Input
                    label="New password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                  <Input
                    label="Confirm new password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwForm.confirmPassword}
                    error={mismatch ? "Passwords do not match" : undefined}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
                {pwForm.newPassword && (
                  <div className={styles.strength}>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3, 4].map((i) => (
                        <span key={i} className={i <= strength ? styles[`s${strength}`] : ""} />
                      ))}
                    </div>
                    <span className={styles.strengthLabel}>{STRENGTH[strength]}</span>
                  </div>
                )}
                <button type="button" className={styles.showPw} onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />} {showPw ? "Hide" : "Show"} passwords
                </button>
                <div className={styles.actions}>
                  <Button
                    type="submit"
                    loading={savingPw}
                    disabled={!pwForm.currentPassword || !pwForm.newPassword || !!mismatch}
                  >
                    Update password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <AvatarCropper file={cropFile} saving={savingPhoto} onCancel={() => setCropFile(null)} onSave={savePhoto} />
    </div>
  );
};

export default Settings;
