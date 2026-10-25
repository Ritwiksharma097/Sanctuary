// Rendered moon (art/props.py) with a soft halo. Fixed in the top-right corner by default.
export default function Moon({ size = 72, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: "36px",
        right: "clamp(24px, 7vw, 96px)",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        boxShadow: "0 0 50px 14px rgba(235,225,190,0.16), 0 0 120px 40px rgba(200,210,240,0.06)",
        zIndex: 1,
        pointerEvents: "none",
        ...style,
      }}
    >
      <img src="/art/moon.webp" alt="" width={size} height={size} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
