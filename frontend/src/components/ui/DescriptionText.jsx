import { useState } from "react";
import styles from "./DescriptionText.module.css";

/**
 * Renders a description with smart clamping.
 * Shows up to `maxLines` lines (default 2). If the text is longer,
 * a "Show more / Show less" toggle appears inline.
 *
 * Props:
 *   text      — the description string
 *   maxChars  — hard char preview limit before showing toggle (default 160)
 *   className — extra class on the wrapper
 */
const DescriptionText = ({ text, maxChars = 160, className = "" }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong    = text.length > maxChars;
  const displayed = !expanded && isLong ? text.slice(0, maxChars).trimEnd() : text;

  return (
    <p className={[styles.desc, className].join(" ")}>
      {displayed}
      {!expanded && isLong && <span className={styles.ellipsis}>…</span>}
      {isLong && (
        <button
          type="button"
          className={styles.toggle}
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </p>
  );
};

export default DescriptionText;
