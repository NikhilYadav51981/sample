import { Auth0Client } from "@auth0/nextjs-auth0/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const hasAuth0Env = Boolean(
  process.env.AUTH0_DOMAIN &&
  process.env.AUTH0_CLIENT_ID &&
  (process.env.AUTH0_CLIENT_SECRET || process.env.AUTH0_CLIENT_ASSERTION_SIGNING_KEY) &&
  process.env.APP_BASE_URL &&
  process.env.AUTH0_SECRET
);

export const auth0 = hasAuth0Env
  ? new Auth0Client()
  : {
      // No-op middleware and session when not configured
      middleware: async (_req: NextRequest) => NextResponse.next(),
      getSession: async () => null,
    };


