import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // Путь, требующий авторизации
  const protectedRoutes = ["/dashboard", "/settings"];

  // Проверяем, является ли путь защищенным
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Если токен есть, проверяем его срок действия
  if (!token) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    try {
      if (refreshToken) {
        const response = await fetch("http://localhost:5000/api/auth/refresh", {
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
            maxAge: 15 * 60, // 15 минут
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
