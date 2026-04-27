import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// These admin paths don't require a completed session
const UNAUTHENTICATED_ALLOWED = ["/admin/login", "/admin/enroll"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const isPublicAdminPath = UNAUTHENTICATED_ALLOWED.some((p) =>
    pathname.startsWith(p)
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — send to login (unless already going there)
  if (!user) {
    if (isPublicAdminPath) return response;
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Logged in — check MFA level for protected routes
  if (!isPublicAdminPath && pathname !== "/admin/mfa") {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      return NextResponse.redirect(new URL("/admin/mfa", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
