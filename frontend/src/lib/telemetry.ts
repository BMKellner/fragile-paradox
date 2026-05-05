const TELEMETRY_ENDPOINT = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT;

type TelemetryEventName =
  | "design_mode_opened"
  | "design_mode_closed"
  | "design_edit_start"
  | "design_edit_applied"
  | "design_save"
  | "design_export_json"
  | "design_export_pdf";

type TelemetryPayload = {
  event: TelemetryEventName;
  user_id?: string;
  portfolio_id?: string;
  user_template_id?: string;
  metadata?: Record<string, unknown>;
  at: string;
};

export function trackTelemetryEvent(input: {
  event: TelemetryEventName;
  userId?: string;
  portfolioId?: string;
  userTemplateId?: string;
  metadata?: Record<string, unknown>;
}): void {
  const payload: TelemetryPayload = {
    event: input.event,
    user_id: input.userId,
    portfolio_id: input.portfolioId,
    user_template_id: input.userTemplateId,
    metadata: input.metadata,
    at: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    // Keep local visibility during development while backend telemetry is optional.
    console.info("[telemetry]", payload);
  }

  if (!TELEMETRY_ENDPOINT || typeof window === "undefined") return;

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
      return;
    }

    void fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  } catch {
    // Best-effort telemetry only.
  }
}
