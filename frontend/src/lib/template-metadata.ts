export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  bestFor: Array<"Tech" | "Creative" | "Corporate" | "Academic" | "Writer" | "Creator">;
};

export const templateNames: Record<string, string> = {
  "1": "Modern Minimal",
  "2": "Classic Professional",
  "3": "Creative Bold",
  "4": "Elegant Sophisticated",
  "5": "SideRail Pro",
  "6": "Editorial Story",
  "7": "IDE Clean",
  "8": "debug-template",
  "9": "Bold Brand",
  "10": "Minimal Creator Hub",
  custom: "Custom Template",
};

export const galleryTemplates: TemplateMeta[] = [
  {
    id: "1",
    name: "Modern Minimal",
    description: "Sharp modern layout with confident spacing and clean hierarchy.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "5",
    name: "SideRail Pro",
    description: "Alternating chapter runway with geometric cards and blueprint-style depth.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "6",
    name: "Editorial Story",
    description: "Writing-first case-study format with generous margins and pace.",
    bestFor: ["Writer", "Academic"],
  },
  {
    id: "7",
    name: "IDE Clean",
    description: "Panel-style, tool-native UI language with crisp tags and separators.",
    bestFor: ["Tech", "Creator"],
  },
  {
    id: "8",
    name: "debug-template",
    description: "Debug-focused layout for formatting and structure validation.",
    bestFor: ["Academic", "Corporate"],
  },
  {
    id: "9",
    name: "Bold Brand",
    description: "Oversized hero and high-impact project cards for standout positioning.",
    bestFor: ["Creative", "Creator"],
  },
  {
    id: "10",
    name: "Minimal Creator Hub",
    description: "Dense, tag-forward profile built for creators shipping continuously.",
    bestFor: ["Creator", "Tech"],
  },
];
