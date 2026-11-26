import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

const TEXT_EXT  = ["txt", "md", "csv", "json", "log", "xml", "yml", "yaml", "js", "jsx", "ts", "tsx", "css", "html", "py", "java", "sql", "sh"];
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
const VIDEO_EXT = ["mp4", "webm", "ogg", "mov"];
const AUDIO_EXT = ["mp3", "wav", "m4a"];
const MAX_TEXT_BYTES = 500 * 1024;

const extOf = (s = "") => (s.split("?")[0].split(".").pop() || "").toLowerCase();

// Show the real file name; older uploads only have the stored (hashed) name.
export const getFileLabel = (name, url = "") => {
  if (name) return name;
  try { return decodeURIComponent(url.split("/").pop()) || "Attachment"; } catch { return "Attachment"; }
};

const getKind = (name, url, type = "") => {
  const ext = extOf(name) || extOf(url);
  if (type.startsWith("image/") || IMAGE_EXT.includes(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("video/") || VIDEO_EXT.includes(ext)) return "video";
  if (type.startsWith("audio/") || AUDIO_EXT.includes(ext)) return "audio";
  if (type.startsWith("text/") || type === "application/json" || TEXT_EXT.includes(ext)) return "text";
  return "other";
};

const TextPreview = ({ url }) => {
  const [state, setState] = useState({ loading: true, text: "", error: false, truncated: false });

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error("bad response"); return r.text(); })
      .then((t) => {
        if (cancelled) return;
        const truncated = t.length > MAX_TEXT_BYTES;
        setState({ loading: false, text: truncated ? t.slice(0, MAX_TEXT_BYTES) : t, error: false, truncated });
      })
      .catch(() => !cancelled && setState({ loading: false, text: "", error: true, truncated: false }));
    return () => { cancelled = true; };
  }, [url]);

  if (state.loading) return <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>;
  if (state.error) return <p style={{ color: "var(--color-danger)" }}>Could not load this file.</p>;
  return (
    <>
      <pre style={{
        margin: 0, padding: "var(--space-3)", maxHeight: "65vh", overflow: "auto",
        background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)", fontSize: "var(--font-size-xs)",
        whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--color-text)",
      }}>{state.text}</pre>
      {state.truncated && (
        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Showing the first 500 KB. Download the file to see the rest.
        </p>
      )}
    </>
  );
};

/**
 * In-app viewer for an uploaded file: { url, name, type }.
 * Images, PDF, video, audio and text/code/CSV/JSON render inline.
 * Other types (Word, Excel, PowerPoint, ...) can't be rendered by a browser,
 * so they get a download / open action instead.
 */
const FileViewer = ({ file, onClose }) => {
  const open = !!file;
  const url  = file?.url || "";
  const name = getFileLabel(file?.name, url);
  const kind = open ? getKind(file.name, url, file.type) : "other";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      width={kind === "pdf" ? 960 : 760}
      footer={
        open && (
          <>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="secondary" icon={<ExternalLink size={14} />}>Open in new tab</Button>
            </a>
            <a href={url} download={name} style={{ textDecoration: "none" }}>
              <Button icon={<Download size={14} />}>Download</Button>
            </a>
          </>
        )
      }
    >
      {open && kind === "image" && (
        <img src={url} alt={name} style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto", borderRadius: "var(--radius-md)" }} />
      )}
      {open && kind === "pdf" && (
        <iframe src={url} title={name} style={{ width: "100%", height: "70vh", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }} />
      )}
      {open && kind === "video" && (
        <video src={url} controls style={{ width: "100%", maxHeight: "70vh", borderRadius: "var(--radius-md)" }} />
      )}
      {open && kind === "audio" && <audio src={url} controls style={{ width: "100%" }} />}
      {open && kind === "text" && <TextPreview url={url} />}
      {open && kind === "other" && (
        <div style={{ textAlign: "center", padding: "var(--space-6) 0", color: "var(--color-text-secondary)" }}>
          <FileText size={40} style={{ color: "var(--color-text-muted)" }} />
          <p style={{ marginTop: "var(--space-3)" }}>
            A preview isn't available for <strong>.{extOf(name) || "this"}</strong> files in the browser.
          </p>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Use Download to open it in the matching app.</p>
        </div>
      )}
    </Modal>
  );
};

export default FileViewer;
