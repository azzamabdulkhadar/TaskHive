import { useRef } from "react";
import { Bold, Italic, Heading2, List, ListOrdered, Code } from "lucide-react";
import Textarea from "./Textarea";
import styles from "./MarkdownEditor.module.css";

// Wrap the selection, or insert the markers with the caret between them
const wrap = (value, start, end, before, after = before) => {
  const sel = value.slice(start, end) || "text";
  const next = value.slice(0, start) + before + sel + after + value.slice(end);
  return { next, selStart: start + before.length, selEnd: start + before.length + sel.length };
};

// Prefix every selected line (or toggle the prefix off if all lines already have it)
const prefixLines = (value, start, end, prefixFor) => {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = value.length;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const has = lines.every((l, i) => l.startsWith(prefixFor(i)));
  const out = lines.map((l, i) => (has ? l.slice(prefixFor(i).length) : prefixFor(i) + l)).join("\n");
  return { next: value.slice(0, lineStart) + out + value.slice(lineEnd), selStart: lineStart, selEnd: lineStart + out.length };
};

const ACTIONS = [
  { key: "bold",   title: "Bold (Ctrl+B)",   icon: Bold,        run: (v, s, e) => wrap(v, s, e, "**") },
  { key: "italic", title: "Italic (Ctrl+I)", icon: Italic,      run: (v, s, e) => wrap(v, s, e, "*") },
  { key: "h",      title: "Heading",         icon: Heading2,    run: (v, s, e) => prefixLines(v, s, e, () => "## ") },
  { key: "ul",     title: "Bullet list",     icon: List,        run: (v, s, e) => prefixLines(v, s, e, () => "- ") },
  { key: "ol",     title: "Numbered list",   icon: ListOrdered, run: (v, s, e) => prefixLines(v, s, e, (i) => `${i + 1}. `) },
  { key: "code",   title: "Code",            icon: Code,        run: (v, s, e) => wrap(v, s, e, "`") },
];

/** Textarea with a small Markdown toolbar. Stores plain Markdown text. */
const MarkdownEditor = ({ value, onChange, ...props }) => {
  const ref = useRef(null);

  const apply = (action) => {
    const ta = ref.current;
    if (!ta) return;
    const { next, selStart, selEnd } = action.run(value, ta.selectionStart, ta.selectionEnd);
    if (props.maxLength && next.length > props.maxLength) return;
    onChange(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(selStart, selEnd); });
  };

  const onKeyDown = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    const action = k === "b" ? ACTIONS[0] : k === "i" ? ACTIONS[1] : null;
    if (action) { e.preventDefault(); apply(action); }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
        {ACTIONS.map((a) => (
          <button key={a.key} type="button" className={styles.btn} title={a.title}
            onMouseDown={(e) => e.preventDefault()} onClick={() => apply(a)}>
            <a.icon size={14} />
          </button>
        ))}
      </div>
      <Textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} {...props} />
    </div>
  );
};

export default MarkdownEditor;
