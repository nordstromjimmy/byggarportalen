import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          );
        },
      },
    }
  );

  // IMPORTANT: Don't remove getClaims()
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = ["/", "/login", "/register", "/integritet", "/kontakt"];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // If user is logged in and visits "/", redirect to /dashboard
  if ((user && pathname === "/") || (user && pathname === "/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // or "/app"
    return NextResponse.redirect(url);
  }

  // If no user and path is NOT public, redirect to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Optional: let them come back to where they were trying to go
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as per docs
  return supabaseResponse;
}
