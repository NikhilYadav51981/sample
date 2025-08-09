import { type NextRequest } from "next/server";

export interface AppContext {
  userId?: string | null;
  req?: NextRequest;
}

export function createTRPCContext(): AppContext {
  // In a real app, you would extract user info from headers, cookies, etc.
  // For this demo, we'll return a basic context
  return {
    userId: null, // Could be extracted from auth headers/cookies
  };
}
