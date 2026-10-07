import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plus, Search, Pin, Archive, Trash2, Edit3,
  LayoutGrid, List, Tag, Paperclip, X, FileText, ExternalLink,
} from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import DescriptionText from "../../components/ui/DescriptionText";
import { getNotes, createNote, updateNote, deleteNote } from "../../services/api/notesService";
import { uploadFile } from "../../services/api/uploadService";
import { PRIORITY_COLORS, NOTE_COLORS } from "../../constants";
import { formatDate, debounce } from "../../utils";
import styles from "./Notes.module.css";

const EMPTY_FORM = { title: "", content: "", tags: "", category: "", priority: "medium", color: "#ffffff", isPinned: false, file: "" };

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onToggleArchive, view }) => {
  const pc = PRIORITY_COLORS[note.priority] || PRIORITY_COLORS.medium;
  const isListView = view === "list";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={[styles.noteCard, isListView ? styles.listView : ""].join(" ")}
      style={{ "--note-color": note.color || "#ffffff", borderLeft: `3px solid ${pc.text}` }}
    >
      {/* ── Row 1: Title (left) + Action icons (right) ── */}
      <div className={styles.noteCardHeader}>
        <div className={styles.noteTitleRow}>
          {note.isPinned && <Pin size={12} className={styles.pinIcon} />}
          <span className={styles.noteTitle}>{note.title}</span>
        </div>
        <div className={styles.noteActions}>
          <button className={styles.actionBtn} onClick={() => onEdit(note)} title="Edit">
            <Edit3 size={13} />
          </button>
          <button
            className={[styles.actionBtn, note.isPinned ? styles.actionActive : ""].join(" ")}
            onClick={() => onTogglePin(note)}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <Pin size={13} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onToggleArchive(note)}
            title={note.isArchived ? "Unarchive" : "Archive"}
          >
            <Archive size={13} />
          </button>
          <button
            className={[styles.actionBtn, styles.dangerBtn].join(" ")}
            onClick={() => onDelete(note._id)}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Full-width content ── */}
      {note.content && (
        <DescriptionText
          text={note.content}
          maxChars={isListView ? 160 : 180}
          className={styles.noteContent}
        />
      )}

      {/* ── Row 3: Attachment (if any) ── */}
      {note.file && (
        <div className={styles.noteAttachment}>
          <FileText size={12} />
          <a
            href={note.file}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attachLink}
            onClick={(e) => e.stopPropagation()}
          >
            {decodeURIComponent(note.file.split("/").pop()).slice(0, 40) || "Attachment"}
          </a>
          <ExternalLink size={10} className={styles.attachExt} />
        </div>
      )}

      {/* ── Row 4: Tags (left) + Priority badge + Date (right) ── */}
      <div className={styles.noteFooter}>
        <div className={styles.noteTags}>
          {(note.tags || []).slice(0, 4).map((t) => (
            <span key={t} className={styles.tag}><Tag size={10} />{t}</span>
          ))}
        </div>
        <div className={styles.noteMeta}>
          <Badge bg={pc.bg} color={pc.text}>{pc.label}</Badge>
          <span className={styles.noteDate}>{formatDate(note.updatedAt, "MMM D")}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Notes = () => {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("grid"); // grid | list
  const [search, setSearch]     = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showArchived, setShowArchived]     = useState(false);
  const [modal, setModal]       = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  // File attachment state
  const [fileObj, setFileObj]       = useState(null);   // raw File from picker
  const [filePreview, setFilePreview] = useState("");   // local object URL for images
  const [uploading, setUploading]   = useState(false);
  const fileInputRef = useRef(null);

  const loadNotes = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const params = { limit: 100, isArchived: showArchived };
      if (q)             params.search   = q;
      if (filterPriority) params.priority = filterPriority;
      const res = await getNotes(params);
      setNotes(res.data?.data?.notes ?? []);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [showArchived, filterPriority]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLoad = useCallback(debounce((q) => loadNotes(q), 350), [loadNotes]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const openCreate = () => { setEditNote(null); setForm(EMPTY_FORM); setErrors({}); setFileObj(null); setFilePreview(""); setModal(true); };
  const openEdit   = (n)  => {
    setEditNote(n);
    setForm({ title: n.title, content: n.content || "", tags: (n.tags || []).join(", "), category: n.category || "", priority: n.priority || "medium", color: n.color || "#ffffff", isPinned: n.isPinned || false, file: n.file || "" });
    setErrors({});
    setFileObj(null);
    setFilePreview("");
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: "Title is required" }); return; }
    setSaving(true);
    try {
      // Upload new file if one was picked
      let fileUrl = form.file || "";
      if (fileObj) {
        setUploading(true);
        try {
          fileUrl = await uploadFile(fileObj);
          if (!fileUrl) throw new Error("Upload returned no URL");
        } catch {
          toast.error("File upload failed. Note saved without attachment.");
          fileUrl = form.file || "";
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        ...form,
        file: fileUrl,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editNote) {
        const res = await updateNote(editNote._id, payload);
        setNotes((n) => n.map((x) => x._id === editNote._id ? res.data.data.note : x));
        toast.success("Note updated");
      } else {
        const res = await createNote(payload);
        setNotes((n) => [res.data.data.note, ...n]);
        toast.success("Note created");
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes((n) => n.filter((x) => x._id !== id));
      toast.success("Note deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await updateNote(note._id, { isPinned: !note.isPinned });
      setNotes((n) => n.map((x) => x._id === note._id ? res.data.data.note : x));
    } catch { toast.error("Failed to update note"); }
  };

  const handleToggleArchive = async (note) => {
    try {
      const res = await updateNote(note._id, { isArchived: !note.isArchived });
      setNotes((n) => n.filter((x) => x._id !== note._id)); // remove from current view
      toast.success(note.isArchived ? "Note unarchived" : "Note archived");
    } catch { toast.error("Failed to update note"); }
  };

  const pinned  = notes.filter((n) => n.isPinned);
  const regular = notes.filter((n) => !n.isPinned);

  return (
    <div className={styles.page}>
      <Topbar
        title="Notes"
        actions={
          <Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Note</Button>
        }
      />

      <div className={styles.content}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Input
              placeholder="Search notes…"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); debouncedLoad(e.target.value); }}
            />
          </div>
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Button
            variant={showArchived ? "primary" : "secondary"}
            size="sm"
            icon={<Archive size={14} />}
            onClick={() => setShowArchived((s) => !s)}
          >
            {showArchived ? "Active" : "Archived"}
          </Button>
          <button className={[styles.viewBtn, view === "grid" ? styles.active : ""].join(" ")} onClick={() => setView("grid")} title="Grid view"><LayoutGrid size={16} /></button>
          <button className={[styles.viewBtn, view === "list" ? styles.active : ""].join(" ")} onClick={() => setView("list")} title="List view"><List size={16} /></button>
        </div>

        {loading ? (
          <div className={[styles.notesGrid, view === "list" ? styles.listGrid : ""].join(" ")}>
            {[1,2,3,4,5,6].map((i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Tag size={22} /></div>
            <h3>No notes yet</h3>
            <p>Capture your first idea and keep everything organized.</p>
            <Button onClick={openCreate} icon={<Plus size={14} />}>Create Note</Button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}><Pin size={13} /> Pinned</div>
                <AnimatePresence>
                  <div className={[styles.notesGrid, view === "list" ? styles.listGrid : ""].join(" ")}>
                    {pinned.map((n) => (
                      <NoteCard key={n._id} note={n} view={view}
                        onEdit={openEdit} onDelete={handleDelete}
                        onTogglePin={handleTogglePin} onToggleArchive={handleToggleArchive} />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
            {regular.length > 0 && (
              <div className={styles.section}>
                {pinned.length > 0 && <div className={styles.sectionLabel}>All Notes</div>}
                <AnimatePresence>
                  <div className={[styles.notesGrid, view === "list" ? styles.listGrid : ""].join(" ")}>
                    {regular.map((n) => (
                      <NoteCard key={n._id} note={n} view={view}
                        onEdit={openEdit} onDelete={handleDelete}
                        onTogglePin={handleTogglePin} onToggleArchive={handleToggleArchive} />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editNote ? "Edit Note" : "New Note"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editNote ? "Save Changes" : "Create Note"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Title *" placeholder="Note title" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
          <Textarea label="Content" placeholder="Write your note…" rows={5} value={form.content}
            maxLength={2000}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <Select label="Priority" value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input label="Category" placeholder="e.g. Work" value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <Input label="Tags (comma-separated)" placeholder="e.g. ideas, work, personal"
            icon={<Tag size={14} />}
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          {/* Color picker */}
          <div>
            <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Color</label>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {NOTE_COLORS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c,
                    border: form.color === c ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
                    cursor: "pointer",
                  }} />
              ))}
            </div>
          </div>

          {/* File attachment */}
          <div>
            <label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>
              Attachment
            </label>

            {/* Current / newly picked file preview */}
            {(form.file || fileObj) && (
              <div className={styles.attachPreview}>
                {/* Image preview */}
                {fileObj && fileObj.type.startsWith("image/") ? (
                  <img
                    src={filePreview}
                    alt="preview"
                    className={styles.attachImg}
                  />
                ) : form.file && /\.(png|jpe?g|gif|webp)$/i.test(form.file) ? (
                  <img
                    src={form.file}
                    alt="attachment"
                    className={styles.attachImg}
                  />
                ) : (
                  <div className={styles.attachFilename}>
                    <FileText size={14} />
                    <span>{fileObj ? fileObj.name : decodeURIComponent(form.file.split("/").pop())}</span>
                    {form.file && !fileObj && (
                      <a href={form.file} target="_blank" rel="noopener noreferrer" className={styles.attachOpenLink}>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
                {/* Remove button */}
                <button
                  type="button"
                  className={styles.attachRemove}
                  onClick={() => {
                    setFileObj(null);
                    setFilePreview("");
                    setForm((f) => ({ ...f, file: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  title="Remove attachment"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Pick button — hidden when a file is already chosen */}
            {!form.file && !fileObj && (
              <button
                type="button"
                className={styles.attachPickBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} />
                Choose file
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 10 * 1024 * 1024) {
                  toast.error("File must be under 10 MB");
                  return;
                }
                setFileObj(f);
                if (f.type.startsWith("image/")) {
                  const url = URL.createObjectURL(f);
                  setFilePreview(url);
                } else {
                  setFilePreview("");
                }
                // Clear any previously saved URL — new file will replace it on save
                setForm((frm) => ({ ...frm, file: "" }));
              }}
            />
            {uploading && (
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                Uploading…
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notes;
