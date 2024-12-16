import { api } from "@/hooks/api";

export const fetchUserData = async (token) => {
  const response = await fetch(`${api}/auth/profiles/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
