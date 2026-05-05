const DESIGN_MODE_OVERRIDE_KEY = "feature:design_mode_editor";

const envEnabled = (() => {
  const value = process.env.NEXT_PUBLIC_ENABLE_DESIGN_MODE_EDITOR;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
})();

const isNonProductionRuntime = () => {
  const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase();
  if (runtimeEnv === "staging" || runtimeEnv === "development" || runtimeEnv === "dev") {
    return true;
  }

  return process.env.NODE_ENV !== "production";
};

export function isDesignModeAvailableForRuntime(): boolean {
  return envEnabled && isNonProductionRuntime();
}

export function setDesignModeUserOverride(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DESIGN_MODE_OVERRIDE_KEY, enabled ? "1" : "0");
}

export function readDesignModeUserOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(DESIGN_MODE_OVERRIDE_KEY);
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

export function isDesignModeEnabledForUser(): boolean {
  if (!isDesignModeAvailableForRuntime()) return false;

  const override = readDesignModeUserOverride();
  if (override !== null) return override;

  return true;
}
