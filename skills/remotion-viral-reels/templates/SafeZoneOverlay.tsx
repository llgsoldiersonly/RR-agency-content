import { AbsoluteFill } from "remotion";

// Dev-only visual guide. Gate with REMOTION_DEV_SAFEZONES=1 before importing.
// Renders the universal safe zone, caption preferred area, and forbidden regions
// on top of the composition so layout problems are obvious in remotion studio.
export const SafeZoneOverlay: React.FC = () => {
  const box = (
    x: number, y: number, w: number, h: number,
    color: string, label?: string
  ) => (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h,
      outline: `2px dashed ${color}`,
      background: `${color}11`,
      color, fontFamily: "monospace", fontSize: 18, padding: 6,
    }}>{label}</div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 9999 }}>
      {box(0, 0, 1080, 320, "#ff3b30", "TOP DANGER (0–320)")}
      {box(0, 1500, 1080, 420, "#ff3b30", "BOTTOM DANGER (1500–1920)")}
      {box(900, 500, 180, 1000, "#ff9500", "RIGHT RAIL (engagement btns)")}
      {box(120, 360, 780, 1080, "#34c759", "UNIVERSAL SAFE ZONE")}
      {box(120, 720, 780, 560, "#0a84ff", "CAPTION PREFERRED")}
      {box(120, 1180, 740, 270, "#bf5af2", "CTA PREFERRED")}
    </AbsoluteFill>
  );
};
