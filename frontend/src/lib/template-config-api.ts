import type { TemplateConfig } from "@/lib/template-config";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type TemplateConfigPayload = {
  portfolio_id: string;
  template_config: TemplateConfig;
};

export async function fetchTemplateConfig(params: {
  portfolioId: string;
  token: string;
}): Promise<TemplateConfig | null> {
  if (!backendUrl) return null;

  const response = await fetch(
    `${backendUrl}/portfolios/${params.portfolioId}/template-config`,
    {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
    }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Failed to fetch template config");
  }

  const body = (await response.json()) as TemplateConfigPayload;
  return body.template_config ?? null;
}

export async function saveTemplateConfig(params: {
  portfolioId: string;
  token: string;
  config: TemplateConfig;
}): Promise<TemplateConfig> {
  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  const response = await fetch(
    `${backendUrl}/portfolios/${params.portfolioId}/template-config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ template_config: params.config }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save template config");
  }

  const body = (await response.json()) as TemplateConfigPayload;
  return body.template_config;
}
