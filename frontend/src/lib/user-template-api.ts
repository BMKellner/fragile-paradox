import type {
  UserTemplateDocument,
  UserTemplateRecord,
  UserTemplateVersionRecord,
} from "@/lib/template-config-types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type UserTemplateCreatePayload = {
  name: string;
  template_id: string;
  schema_version: number;
  document: UserTemplateDocument;
  portfolio_id?: string | null;
};

type UserTemplateUpdatePayload = {
  name?: string;
  template_id?: string;
  schema_version?: number;
  document?: UserTemplateDocument;
  portfolio_id?: string | null;
  increment_version?: boolean;
  change_summary?: string;
};

const authHeaders = (token: string, includeJson = false): HeadersInit => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

async function requireBackendUrl(): Promise<string> {
  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }
  return backendUrl;
}

export async function listUserTemplates(params: {
  token: string;
  limit?: number;
  offset?: number;
  portfolioId?: string;
  templateId?: string;
}): Promise<UserTemplateRecord[]> {
  const base = await requireBackendUrl();

  const search = new URLSearchParams();
  if (typeof params.limit === "number") search.set("limit", String(params.limit));
  if (typeof params.offset === "number") search.set("offset", String(params.offset));
  if (params.portfolioId) search.set("portfolio_id", params.portfolioId);
  if (params.templateId) search.set("template_id", params.templateId);

  const query = search.toString();
  const response = await fetch(`${base}/user-templates/${query ? `?${query}` : ""}`, {
    headers: authHeaders(params.token),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user templates");
  }

  return (await response.json()) as UserTemplateRecord[];
}

export async function createUserTemplate(params: {
  token: string;
  payload: UserTemplateCreatePayload;
}): Promise<UserTemplateRecord> {
  const base = await requireBackendUrl();

  const response = await fetch(`${base}/user-templates/`, {
    method: "POST",
    headers: authHeaders(params.token, true),
    body: JSON.stringify(params.payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create user template");
  }

  return (await response.json()) as UserTemplateRecord;
}

export async function getUserTemplate(params: {
  token: string;
  userTemplateId: string;
}): Promise<UserTemplateRecord> {
  const base = await requireBackendUrl();

  const response = await fetch(`${base}/user-templates/${params.userTemplateId}`, {
    headers: authHeaders(params.token),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user template");
  }

  return (await response.json()) as UserTemplateRecord;
}

export async function updateUserTemplate(params: {
  token: string;
  userTemplateId: string;
  payload: UserTemplateUpdatePayload;
}): Promise<UserTemplateRecord> {
  const base = await requireBackendUrl();

  const response = await fetch(`${base}/user-templates/${params.userTemplateId}`, {
    method: "PATCH",
    headers: authHeaders(params.token, true),
    body: JSON.stringify(params.payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update user template");
  }

  return (await response.json()) as UserTemplateRecord;
}

export async function deleteUserTemplate(params: {
  token: string;
  userTemplateId: string;
}): Promise<void> {
  const base = await requireBackendUrl();

  const response = await fetch(`${base}/user-templates/${params.userTemplateId}`, {
    method: "DELETE",
    headers: authHeaders(params.token),
  });

  if (!response.ok) {
    throw new Error("Failed to delete user template");
  }
}

export async function listUserTemplateVersions(params: {
  token: string;
  userTemplateId: string;
  limit?: number;
  offset?: number;
}): Promise<UserTemplateVersionRecord[]> {
  const base = await requireBackendUrl();
  const search = new URLSearchParams();
  if (typeof params.limit === "number") search.set("limit", String(params.limit));
  if (typeof params.offset === "number") search.set("offset", String(params.offset));

  const query = search.toString();
  const response = await fetch(
    `${base}/user-templates/${params.userTemplateId}/versions${query ? `?${query}` : ""}`,
    {
      headers: authHeaders(params.token),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user template versions");
  }

  return (await response.json()) as UserTemplateVersionRecord[];
}

export async function revertUserTemplateToVersion(params: {
  token: string;
  userTemplateId: string;
  version: number;
}): Promise<UserTemplateRecord> {
  const base = await requireBackendUrl();

  const response = await fetch(
    `${base}/user-templates/${params.userTemplateId}/versions/${params.version}/revert`,
    {
      method: "POST",
      headers: authHeaders(params.token),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to revert user template version");
  }

  const body = (await response.json()) as { user_template: UserTemplateRecord };
  return body.user_template;
}

export async function exportUserTemplateJson(params: {
  token: string;
  userTemplateId: string;
}): Promise<{
  user_template_id: string;
  template_id: string;
  schema_version: number;
  version: number;
  name: string;
  document: UserTemplateDocument;
}> {
  const base = await requireBackendUrl();

  const response = await fetch(`${base}/user-templates/${params.userTemplateId}/export/json`, {
    headers: authHeaders(params.token),
  });

  if (!response.ok) {
    throw new Error("Failed to export user template");
  }

  return (await response.json()) as {
    user_template_id: string;
    template_id: string;
    schema_version: number;
    version: number;
    name: string;
    document: UserTemplateDocument;
  };
}
