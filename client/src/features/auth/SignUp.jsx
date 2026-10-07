import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { registerUser } from "../../services/api/authService";
import { loginSuccess } from "../../redux/slices/sessionSlice";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import styles from "./Auth.module.css";

const SignUp = () => {
  const [form, setForm]         = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", gender: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email)       e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)    e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { name, email, phone, password, gender } = form;
      const res = await registerUser({ name, email, phone, password, gender });
      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        toast.success("Account created!");
        navigate("/app/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <motion.div
        className={styles.card}
        style={{ maxWidth: 480 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}><Zap size={20} color="#fff" /></div>
          <span className={styles.logoText}>TaskHive</span>
        </div>

        <h2 className={styles.heading}>Create your account</h2>
        <p className={styles.sub}>Start your free workspace today</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input label="Full Name" type="text" placeholder="Azzam Abdul Khadar"
            value={form.name} onChange={set("name")} error={errors.name}
            icon={<User size={15} />} autoComplete="name" />

          <Input label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={set("email")} error={errors.email}
            icon={<Mail size={15} />} autoComplete="email" />

          <Input label="Phone (optional)" type="tel" placeholder="+1 234 567 8900"
            value={form.phone} onChange={set("phone")}
            icon={<Phone size={15} />} autoComplete="tel" />

          <Select label="Gender (optional)" value={form.gender} onChange={set("gender")}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </Select>

          <Input label="Password" type={showPass ? "text" : "password"} placeholder="At least 6 characters"
            value={form.password} onChange={set("password")} error={errors.password}
            icon={<Lock size={15} />}
            iconRight={
              <button type="button" onClick={() => setShowPass((s) => !s)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            autoComplete="new-password" />

          <Input label="Confirm Password" type={showPass ? "text" : "password"} placeholder="Repeat your password"
            value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword}
            icon={<Lock size={15} />} autoComplete="new-password" />

          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 8 }}>
            Create account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
