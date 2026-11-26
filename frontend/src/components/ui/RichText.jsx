import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./RichText.module.css";

/**
 * Renders note text as Markdown (bold, italic, bullets, numbered lists, headings,
 * code, quotes, links). Raw HTML is not rendered, so stored text can't inject markup.
 * Long content is collapsed to `collapsedHeight` px with a Show more / Show less toggle.
 */
const RichText = ({ text, collapsedHeight = 150, className = "" }) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // measure with the collapsed height applied; when expanded keep the last result
      if (!expanded) setOverflows(el.scrollHeight > collapsedHeight + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, collapsedHeight, expanded]);

  if (!text) return null;

  return (
    <div className={className}>
      <div
        ref={ref}
        className={[styles.rich, expanded ? styles.expanded : "", !expanded && overflows ? styles.faded : ""].join(" ")}
        style={!expanded ? { maxHeight: collapsedHeight } : undefined}
      >
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{children}</a>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
      {(overflows || expanded) && (
        <button type="button" className={styles.toggle} onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default RichText;
