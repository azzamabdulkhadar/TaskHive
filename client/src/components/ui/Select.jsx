import { forwardRef } from "react";
import styles from "./Input.module.css"; // reuse input styles

const Select = forwardRef(({ label, error, children, containerClass = "", ...props }, ref) => (
  <div className={[styles.container, containerClass].join(" ")}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.inputWrapper}>
      <select
        ref={ref}
        className={[styles.input, error ? styles.hasError : ""].join(" ")}
        style={{ appearance: "none", cursor: "pointer" }}
        {...props}
      >
        {children}
      </select>
    </div>
    {error && <span className={styles.error}>{error}</span>}
  </div>
));
Select.displayName = "Select";
export default Select;
