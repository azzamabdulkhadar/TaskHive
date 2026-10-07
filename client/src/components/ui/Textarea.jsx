import { forwardRef } from "react";
import styles from "./Textarea.module.css";

/**
 * Textarea with optional character counter.
 * Pass `maxLength` to enable the counter (e.g. maxLength={500}).
 */
const Textarea = forwardRef((
  { label, error, hint, rows = 4, maxLength, className = "", containerClass = "", ...props },
  ref
) => {
  const currentLen = typeof props.value === "string" ? props.value.length : 0;
  const nearLimit  = maxLength && currentLen >= maxLength * 0.85; // warn at 85%
  const atLimit    = maxLength && currentLen >= maxLength;

  return (
    <div className={[styles.container, containerClass].join(" ")}>
      {/* Label row — label left, counter right */}
      {(label || maxLength) && (
        <div className={styles.labelRow}>
          {label && <label className={styles.label}>{label}</label>}
          {maxLength && (
            <span
              className={[
                styles.counter,
                nearLimit && !atLimit ? styles.counterWarn  : "",
                atLimit               ? styles.counterLimit : "",
              ].join(" ")}
            >
              {currentLen}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        className={[styles.textarea, error ? styles.hasError : "", className].join(" ")}
        {...props}
      />

      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
