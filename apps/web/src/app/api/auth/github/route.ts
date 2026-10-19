import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${appUrl}/api/auth/callback/github`;

  // If GitHub OAuth credentials are not set up, route to the Sandbox OAuth Simulator
  if (!clientId || clientId.includes("your_github_client_id")) {
    return NextResponse.redirect(`${appUrl}/login?oauth_sandbox=github`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");
  githubAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(githubAuthUrl.toString());
  response.cookies.set("zega_github_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return response;
}
