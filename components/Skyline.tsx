// Contribution-graph skyline along the bottom of the dark hero (git motif shared with the portfolio).
const RAMP = ["#2C4A4E", "#365A5E", "#42686C", "#4F777B"];
const LIME = "#C6F25B";
const COBALT = "#2F5BFF";

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function Skyline() {
  const cols = 88;
  const cells: { x: number; y: number; fill: string }[] = [];
  for (let c = 0; c < cols; c++) {
    const wave = Math.sin(c / 7) * 1.4 + Math.sin(c / 3.1) * 0.9;
    const h = Math.max(1, Math.min(5, Math.round(2.6 + wave + rand(c) * 1.6)));
    for (let r = 0; r < h; r++) {
      const roll = rand(c * 31 + r);
      const fill = roll > 0.86 ? LIME : roll > 0.76 ? COBALT : RAMP[Math.min(3, r)];
      cells.push({ x: c * 18, y: 92 - r * 18, fill });
    }
  }
  return (
    <svg className="skyline" aria-hidden="true" viewBox="0 0 1584 110" preserveAspectRatio="xMidYMax slice">
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width="14" height="14" rx="3" fill={cell.fill} />
      ))}
    </svg>
  );
}
