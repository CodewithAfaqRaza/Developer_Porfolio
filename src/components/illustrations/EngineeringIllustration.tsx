import { useId } from "react";

export function EngineeringIllustration({
  variant = "blocks",
}: {
  variant?: "blocks" | "connections";
}) {
  const shadowId = `shadow-${useId().replace(/:/g, "")}`;
  if (variant === "connections")
    return (
      <svg
        viewBox="0 0 420 340"
        className="engineering-illustration"
        aria-hidden="true"
      >
        <g fill="none" stroke="#777" strokeWidth="1.2">
          <circle cx="220" cy="165" r="106" />
          <circle cx="220" cy="165" r="78" strokeDasharray="3 6" />
          <path d="M80 252L220 165L354 252M80 78L220 165L354 78M220 29V302" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <path
                key={i}
                d={`M${220 + Math.cos(a) * 92} ${165 + Math.sin(a) * 92}L${220 + Math.cos(a) * 106} ${165 + Math.sin(a) * 106}`}
              />
            );
          })}
        </g>
        <g stroke="#222" strokeWidth="1">
          <rect x="185" y="130" width="70" height="70" fill="#f5f5f5" />
          <path
            d="M201 165l11-10m-11 10 11 10m26-20-11 20m23-10-11-10m11 10-11 10"
            fill="none"
            strokeWidth="2.5"
          />
          {[
            [80, 78],
            [80, 252],
            [354, 78],
            [354, 252],
            [220, 29],
            [220, 302],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill={i % 2 ? "#303030" : "#eee"} />
              <circle cx={x} cy={y} r="4" fill={i % 2 ? "#eee" : "#303030"} />
            </g>
          ))}
        </g>
        <text
          x="220"
          y="329"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="9"
          fill="#666"
        >
          ONE CLEAR SYSTEM. CONNECTED POSSIBILITIES.
        </text>
      </svg>
    );
  const cubes = [
    { x: 165, y: 88, s: 73 },
    { x: 244, y: 131, s: 73 },
    { x: 86, y: 131, s: 73 },
    { x: 165, y: 174, s: 73 },
    { x: 165, y: 40, s: 73 },
  ];
  return (
    <svg
      viewBox="0 0 420 350"
      className="engineering-illustration"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={shadowId}>
          <stop stopColor="#000" stopOpacity=".2" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="213" cy="305" rx="153" ry="30" fill={`url(#${shadowId})`} />
      {cubes.map(({ x, y, s }, i) => (
        <g key={i} stroke="#777" strokeWidth=".8">
          <path
            d={`M${x} ${y}l${s} ${-s / 2}l${s} ${s / 2}l${-s} ${s / 2}Z`}
            fill={i === 4 ? "#dedede" : "#f5f5f5"}
          />
          <path
            d={`M${x} ${y}l${s} ${s / 2}v${s}l${-s} ${-s / 2}Z`}
            fill={i === 4 ? "#353535" : "#c8c8c8"}
          />
          <path
            d={`M${x + s} ${y + s / 2}l${s} ${-s / 2}v${s}l${-s} ${s / 2}Z`}
            fill={i === 4 ? "#5c5c5c" : "#e1e1e1"}
          />
          <path
            d={`M${x + 12} ${y + 20}l${s - 24} ${(s - 24) / 2}m${24 - s} ${5 - (s - 24) / 2}l${s - 24} ${(s - 24) / 2}m${24 - s} ${5 - (s - 24) / 2}l${s - 24} ${(s - 24) / 2}`}
            stroke="#999"
          />
        </g>
      ))}
      <text x="29" y="330" fontFamily="monospace" fontSize="9" fill="#666">
        STRUCTURE / CLARITY / PURPOSE
      </text>
    </svg>
  );
}
