import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const CRM_PATHS = [
  "/",
  "/app",
  "/accounts",
  "/tasks",
  "/videos",
  "/inbox",
  "/settings",
  "/figma-test",
];

const AUTH_TIMEOUT_MS = 2000;

function isCrmPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return CRM_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/v/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/share/")
  );
}

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

const DEMO_MODE =
  process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_AUTH_COOKIE = "demo-auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes: no auth — /login, /ping, /api/health, /figma-test, /share/*, /watch/*, etc.
  const PUBLIC_PATHS = ["/login", "/ping", "/figma-test"];
  const PUBLIC_PREFIXES = [
    "/api/health",
    "/api/health/",
    "/share/",
    "/watch/",
    "/figma/",
    "/v/",
    "/uploads/",
    "/api/public/",
  ];
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/health/") ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!isCrmPath(pathname)) return NextResponse.next();

  if (DEMO_MODE && request.cookies.get(DEMO_AUTH_COOKIE)?.value === "1") {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url as URL);
    }
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url as URL);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  type CookieTuple = { name: string; value: string; options?: Record<string, unknown> };
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieTuple[]) {
        cookiesToSet.forEach(({ name, value, options }: CookieTuple) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let data: { user: unknown } | null = null;
  try {
    const result = (await timeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS)) as {
      data: { user: unknown } | null;
    };
    data = result.data;
  } catch {
    data = { user: null };
  }

  if (!data?.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url as URL);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url as URL);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/login/:path*",
    "/ping",
    "/figma-test",
    "/figma-test/:path*",
    "/share/:path*",
    "/watch/:path*",
    "/app/:path*",
    "/accounts/:path*",
    "/tasks/:path*",
    "/videos/:path*",
    "/inbox/:path*",
    "/settings/:path*",
    "/api/public/:path*",
    "/api/health",
    "/api/health/:path*",
  ],
};
