/**
 * Type declarations so middleware.ts resolves when node_modules isn't visible to the IDE.
 * Full types come from "next" and "@supabase/ssr" when present in node_modules.
 */
declare module "next/server" {
  export interface NextURLLike extends URL {
    clone(): NextURLLike;
  }
  export class NextResponse extends Response {
    static next(options?: { request?: { headers: Headers } }): NextResponse;
    static redirect(url: URL | string | NextURLLike, status?: number): NextResponse;
    cookies: {
      set(name: string, value: string, options?: Record<string, unknown>): void;
    };
  }
  export interface NextRequest extends Request {
    nextUrl: NextURLLike;
    cookies: {
      get(name: string): { value: string } | undefined;
      getAll(): { name: string; value: string }[];
    };
  }
}

declare module "@supabase/ssr" {
  export function createServerClient(
    url: string,
    key: string,
    options: {
      cookies: {
        getAll(): { name: string; value: string }[];
        setAll(
          cookies: { name: string; value: string; options?: Record<string, unknown> }[]
        ): void;
      };
    }
  ): {
    auth: {
      getUser(): Promise<{ data: { user: unknown } | null }>;
    };
  };
}
