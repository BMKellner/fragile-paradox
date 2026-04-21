import type { TemplateConfig } from "@/lib/template-config";

type TemplateConfigPayload = {
  portfolio_id: string;
  template_config: TemplateConfig;
};

export async function fetchTemplateConfig(params: {
  portfolioId: string;
  token: string;
}): Promise<TemplateConfig | null> {
  const response = await fetch(
    `/api/backend/portfolios/${params.portfolioId}/template-config`,
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
  const response = await fetch(
    `/api/backend/portfolios/${params.portfolioId}/template-config`,
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
