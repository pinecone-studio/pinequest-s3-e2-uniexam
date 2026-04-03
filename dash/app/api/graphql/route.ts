import { NextRequest } from "next/server";

const LOCAL_GRAPHQL_SERVICE_URL = "http://127.0.0.1:3001/api/graphql";
const REMOTE_GRAPHQL_SERVICE_URL = process.env.GRAPHQL_SERVICE_URL;
const DEV_GRAPHQL_SERVICE_URL =
  process.env.GRAPHQL_SERVICE_URL_LOCAL ?? LOCAL_GRAPHQL_SERVICE_URL;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const auth = request.headers.get("authorization");
  const targets =
    process.env.NODE_ENV === "development"
      ? [
          DEV_GRAPHQL_SERVICE_URL,
          ...(REMOTE_GRAPHQL_SERVICE_URL &&
          REMOTE_GRAPHQL_SERVICE_URL !== DEV_GRAPHQL_SERVICE_URL
            ? [REMOTE_GRAPHQL_SERVICE_URL]
            : []),
        ]
      : [REMOTE_GRAPHQL_SERVICE_URL ?? LOCAL_GRAPHQL_SERVICE_URL];

  let lastError: unknown;

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
        },
        body,
        cache: "no-store",
      });

      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("GraphQL service is unavailable");
}
