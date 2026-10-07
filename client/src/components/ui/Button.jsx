import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}) => {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        loading ? styles.loading : "",
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className={styles.spinner} />
      ) : icon ? (
        <span className={styles.iconLeft}>{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default Button;
