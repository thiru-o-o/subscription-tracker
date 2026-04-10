// No "use client" needed — this component is purely presentational with no state.

// ── Brand config: exact brand color + display initial ─────────────────────────

interface BrandConfig {
  bg: string;      // hex brand color
  text: string;    // text color (always #fff for contrast)
  initial: string; // letter(s) to display
}

const BRANDS: Record<string, BrandConfig> = {
  // Active subscriptions
  Netflix:                { bg: "#E50914", text: "#fff", initial: "N"  },
  Spotify:                { bg: "#1DB954", text: "#fff", initial: "S"  },
  Figma:                  { bg: "#F24E1E", text: "#fff", initial: "F"  },
  Headspace:              { bg: "#FF6B35", text: "#fff", initial: "H"  },
  Notion:                 { bg: "#191919", text: "#fff", initial: "N"  },
  "Amazon Prime":         { bg: "#FF9900", text: "#fff", initial: "A"  },
  "Duolingo Plus":        { bg: "#58CC02", text: "#fff", initial: "D"  },
  "iCloud+":              { bg: "#3478F6", text: "#fff", initial: "iC" },
  "GitHub Copilot":       { bg: "#24292F", text: "#fff", initial: "GH" },
  "YouTube Premium":      { bg: "#FF0000", text: "#fff", initial: "YT" },
  "Cult.fit":             { bg: "#FF3366", text: "#fff", initial: "CF" },
  "Dropbox Plus":         { bg: "#0061FE", text: "#fff", initial: "Db" },
  // Past cancellations
  "Adobe Creative Cloud": { bg: "#FF0000", text: "#fff", initial: "Ai" },
  "LinkedIn Premium":     { bg: "#0A66C2", text: "#fff", initial: "in" },
  "Disney+ Hotstar":      { bg: "#1B1B2F", text: "#fff", initial: "D+" },
  Calm:                   { bg: "#4B9CD3", text: "#fff", initial: "Ca" },
  "Grammarly Premium":    { bg: "#15C39A", text: "#fff", initial: "Gr" },
  "Zoom Pro":             { bg: "#2D8CFF", text: "#fff", initial: "Zm" },
  // Recommendation alternatives
  "YouTube Music":        { bg: "#FF0000", text: "#fff", initial: "YM" },
  "Google One 200 GB":    { bg: "#4285F4", text: "#fff", initial: "G1" },
};

// Deterministic fallback color for unknown services
const PALETTE = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
  "#F97316", "#10B981", "#14B8A6", "#EAB308",
];

function getColor(name: string): string {
  return PALETTE[name.charCodeAt(0) % PALETTE.length];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  name: string;
  logo?: string; // kept for API compatibility but no longer used
  size?: "sm" | "md" | "lg";
}

export default function ServiceAvatar({ name, size = "md" }: Props) {
  const brand = BRANDS[name];

  const sizePx   = { sm: 32, md: 40, lg: 54 }[size];
  const radiusCls = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl" }[size];
  // Two-letter initials use a smaller font so they fit cleanly
  const initial  = brand?.initial ?? name.charAt(0).toUpperCase();
  const twoChar  = initial.length > 1;
  const fontSz   = {
    sm: twoChar ? "10px" : "13px",
    md: twoChar ? "12px" : "16px",
    lg: twoChar ? "16px" : "22px",
  }[size];

  const bg = brand ? brand.bg : getColor(name);

  return (
    <div
      className={`shrink-0 flex items-center justify-center ${radiusCls} select-none`}
      style={{
        width: sizePx,
        height: sizePx,
        background: bg,
        color: "#fff",
        fontSize: fontSz,
        fontWeight: 900,
        letterSpacing: twoChar ? "-0.5px" : "0px",
        fontFamily: "inherit",
      }}
    >
      {initial}
    </div>
  );
}
