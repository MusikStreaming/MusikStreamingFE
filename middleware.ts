import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_API_URL!,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    };

    return new NextResponse(null, {
      status: 204,
      headers: preflightHeaders,
    });
  }

  const response = NextResponse.next();
  response.headers.append("Access-Control-Allow-Credentials", "true");
  response.headers.append(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_API_URL!,
  );
  response.headers.append("Access-Control-Allow-Methods", "POST");
  response.headers.append(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  return response;
}

export const config = {
  matcher: "/api/auth/callback",
};
