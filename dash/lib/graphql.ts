export type GraphQLErrorPayload = {
  message: string;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorPayload[];
};

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as GraphQLResponse<T>;

  if (!res.ok) {
    console.log("GraphQL Request failed with status:", res.status, "Response json:", json);
    throw new Error(json.errors?.[0]?.message ?? `HTTP ${res.status}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (json.data === undefined) {
    throw new Error("Empty GraphQL response");
  }
  return json.data;
}
