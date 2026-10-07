import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { loginUser } from "../../services/api/authService";
import { loginSuccess } from "../../redux/slices/sessionSlice";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./Auth.module.css";

const Login = () => {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        toast.success("Welcome back!");
        navigate("/app/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Decorative background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}><Zap size={20} color="#fff" /></div>
          <span className={styles.logoText}>TaskHive</span>
        </div>

        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
            icon={<Mail size={15} />}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            icon={<Lock size={15} />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 8 }}>
            Sign in
          </Button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className={styles.link}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
