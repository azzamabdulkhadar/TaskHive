const Badge = ({ children, color, bg, className = "", dot = false, style = {} }) => {
  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: bg || "var(--color-bg-secondary)",
        color: color || "var(--color-text-secondary)",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color || "currentColor",
            display: "inline-block",
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
