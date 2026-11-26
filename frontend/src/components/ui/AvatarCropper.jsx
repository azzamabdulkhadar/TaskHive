import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./AvatarCropper.module.css";

const VIEW = 280;   // crop circle diameter on screen (px)
const OUT  = 400;   // exported picture size (px)

/**
 * Lets the user drag and zoom a picture inside a circle, then exports it as a square JPEG.
 * Props: file (File | null), onCancel(), onSave(blob)
 */
const AvatarCropper = ({ file, onCancel, onSave, saving }) => {
  const [src, setSrc]   = useState("");
  const [nat, setNat]   = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos]   = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setPos({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // zoom 1 = image just covers the circle
  const base = nat.w ? Math.max(VIEW / nat.w, VIEW / nat.h) : 1;
  const scale = base * zoom;
  const w = nat.w * scale;
  const h = nat.h * scale;

  const clamp = (p, s = scale) => {
    const maxX = Math.max(0, (nat.w * s - VIEW) / 2);
    const maxY = Math.max(0, (nat.h * s - VIEW) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) };
  };

  const changeZoom = (z) => {
    const next = Math.min(4, Math.max(1, z));
    setZoom(next);
    setPos((p) => clamp(p, base * next));
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    setPos(clamp({ x: drag.current.ox + e.clientX - drag.current.sx, y: drag.current.oy + e.clientY - drag.current.sy }));
  };
  const onPointerUp = () => { drag.current = null; };
  const onWheel = (e) => changeZoom(zoom - e.deltaY * 0.002);

  const handleSave = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    const r = OUT / VIEW;
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background in the JPEG
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(img, (VIEW / 2 + pos.x - w / 2) * r, (VIEW / 2 + pos.y - h / 2) * r, w * r, h * r);
    canvas.toBlob((blob) => blob && onSave(blob), "image/jpeg", 0.9);
  };

  return (
    <Modal
      open={!!file}
      onClose={saving ? undefined : onCancel}
      title="Adjust profile picture"
      width={420}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save picture</Button>
        </>
      }
    >
      <div className={styles.wrap}>
        <div
          className={styles.stage}
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
              style={{
                width: w || "auto",
                height: h || "auto",
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                visibility: nat.w ? "visible" : "hidden",
              }}
            />
          )}
        </div>
        <p className={styles.hint}><Move size={13} /> Drag to reposition. Scroll or use the slider to zoom.</p>
        <div className={styles.zoomRow}>
          <button type="button" onClick={() => changeZoom(zoom - 0.2)} aria-label="Zoom out"><ZoomOut size={16} /></button>
          <input
            type="range" min="1" max="4" step="0.01" value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
          <button type="button" onClick={() => changeZoom(zoom + 0.2)} aria-label="Zoom in"><ZoomIn size={16} /></button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarCropper;
