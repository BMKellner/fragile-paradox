import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function proxy(req: NextRequest, params: { path: string[] }) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 503 });
  }

  const path = params.path.join("/");
  const search = req.nextUrl.search;
  const target = `${BACKEND_URL}/${path}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Strip headers that would cause issues when forwarding
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : req.body;

  const response = await fetch(target, {
    method: req.method,
    headers,
    body,
    // @ts-expect-error - Node 18+ supports duplex
    duplex: "half",
    redirect: "follow",
  });

  const resHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: resHeaders,
  });
}

export const GET = (req: NextRequest, { params }: { params: { path: string[] } }) => proxy(req, params);
export const POST = (req: NextRequest, { params }: { params: { path: string[] } }) => proxy(req, params);
export const PUT = (req: NextRequest, { params }: { params: { path: string[] } }) => proxy(req, params);
export const PATCH = (req: NextRequest, { params }: { params: { path: string[] } }) => proxy(req, params);
export const DELETE = (req: NextRequest, { params }: { params: { path: string[] } }) => proxy(req, params);
