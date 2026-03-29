import { NextRequest } from "next/server";

const GRAPHQL_SERVICE_URL =
  process.env.GRAPHQL_SERVICE_URL ?? "http://127.0.0.1:3001/api/graphql";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const auth = request.headers.get("authorization");

  const res = await fetch(GRAPHQL_SERVICE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
