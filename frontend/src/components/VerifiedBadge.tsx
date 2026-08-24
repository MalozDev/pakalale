"use client";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function VerifiedBadge({ size = "sm", showLabel = true }: VerifiedBadgeProps) {
  const sizes = {
    sm: { icon: 14, text: "text-[9px]", gap: "gap-0.5" },
    md: { icon: 18, text: "text-[10px]", gap: "gap-0.5" },
    lg: { icon: 24, text: "text-xs", gap: "gap-1" },
  };

  const s = sizes[size];

  return (
    <span className={`inline-flex items-center ${showLabel ? s.gap : ""}`}>
      {/* Gold badge star — derived from SVG Repo badge */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          style={{ fill: "#DAA520", stroke: "#B8860B", strokeWidth: 20 }}
          d="M 500,140 L 612,340 L 840,360 L 670,520 L 710,750 L 500,640 L 290,750 L 330,520 L 160,360 L 388,340 Z"
        />
        <path
          style={{ fill: "#FFD700" }}
          d="M 500,200 L 590,360 L 780,375 L 640,510 L 675,700 L 500,610 L 325,700 L 360,510 L 220,375 L 410,360 Z"
        />
      </svg>
      {showLabel && (
        <span className={`${s.text} font-semibold text-[#1877F2]`}>Verified</span>
      )}
    </span>
  );
}
