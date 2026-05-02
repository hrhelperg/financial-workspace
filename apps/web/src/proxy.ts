import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  localeHeaderName,
  pathnameHeaderName,
  stripLocaleFromPathname
} from "@/i18n/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const locale = isLocale(firstSegment) ? firstSegment : defaultLocale;
  const strippedPathname = stripLocaleFromPathname(pathname);
  const shouldRewrite = locale !== defaultLocale && strippedPathname !== pathname;
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(localeHeaderName, locale);
  requestHeaders.set(pathnameHeaderName, pathname);

  function createResponse() {
    const nextResponse = (() => {
      if (shouldRewrite) {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = strippedPathname;
        return NextResponse.rewrite(rewriteUrl, {
          request: {
            headers: requestHeaders
          }
        });
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    })();

    nextResponse.cookies.set(localeCookieName, locale, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return nextResponse;
  }

  let response = createResponse();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = createResponse();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
