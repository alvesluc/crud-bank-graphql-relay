import { FetchFunction, RequestParameters, Variables } from "relay-runtime";

export const fetchGraphQl: FetchFunction = async (
  request: RequestParameters,
  variables: Variables,
) => {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
    credentials: "include"
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("GraphQL network error:", response.status, errorBody);
  }

  const jsonResponse = await response.json();

  if (jsonResponse.errors) {
    console.warn(
      "GraphQL operation completed with errors:",
      jsonResponse.errors,
    );
  }

  return jsonResponse;
}
