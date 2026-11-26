import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Input.module.css"; // reuse input styles

const Select = forwardRef(({ label, error, children, containerClass = "", style, ...props }, ref) => (
  <div className={[styles.container, containerClass].join(" ")}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.inputWrapper}>
      <select
        ref={ref}
        className={[styles.input, error ? styles.hasError : ""].join(" ")}
        {...props}
        style={{ appearance: "none", WebkitAppearance: "none", cursor: "pointer", paddingRight: 36, ...style }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        style={{ position: "absolute", right: 14, pointerEvents: "none", color: "var(--color-text-muted)" }}
      />
    </div>
    {error && <span className={styles.error}>{error}</span>}
  </div>
));
Select.displayName = "Select";
export default Select;
