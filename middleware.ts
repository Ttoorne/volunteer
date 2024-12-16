import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { api } from "@/hooks/api";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // Путь, требующий авторизации
  const protectedRoutes = ["/dashboard", "/settings"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!token) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    try {
      if (refreshToken) {
        const response = await fetch(`${api}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            refreshToken,
          }),
        });

        if (response.ok) {
          const { accessToken } = await response.json();
          const newResponse = NextResponse.next();
          newResponse.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
          });
          return newResponse;
        } else {
          console.error("Failed to refresh token");
        }
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
