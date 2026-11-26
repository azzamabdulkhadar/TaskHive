import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Modal.module.css";

const Modal = ({ open, onClose, title, children, width = 520, footer }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
          <motion.div
            className={styles.modal}
            style={{ maxWidth: width }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>{title}</h3>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div className={styles.body}>{children}</div>
            {/* Footer */}
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
