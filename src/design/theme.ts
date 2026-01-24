export const colors = {
  background: "#F6F5F2",
  surface: "#FFFFFF",
  textPrimary: "#111111",
  textSecondary: "#5C5C5C",
  primary: "#2563EB",
  success: "#22C55E",
  danger: "#EF4444",
  muted: "#E5E7EB",
  chip: "#E0E7FF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
};
