import { NextRequest } from "next/server";

const GRAPHQL_SERVICE_URL =
  process.env.GRAPHQL_SERVICE_URL ?? "http://127.0.0.1:3001/api/graphql";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const auth = request.headers.get("authorization");

  try {
    const response = await fetch(GRAPHQL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body,
      cache: "no-store",
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        errors: [
          {
            message: `Unable to reach GraphQL service at ${GRAPHQL_SERVICE_URL}. Check that your backend is running and GRAPHQL_SERVICE_URL is correct.`,
          },
        ],
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
