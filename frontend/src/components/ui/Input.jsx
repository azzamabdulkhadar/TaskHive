import { forwardRef } from "react";
import styles from "./Input.module.css";

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = "",
  containerClass = "",
  ...props
}, ref) => {
  return (
    <div className={[styles.container, containerClass].join(" ")}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={[styles.inputWrapper, error ? styles.hasError : "", icon ? styles.hasIconLeft : "", iconRight ? styles.hasIconRight : ""].join(" ")}>
        {icon && <span className={styles.iconLeft}>{icon}</span>}
        <input ref={ref} className={[styles.input, className].join(" ")} {...props} />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
