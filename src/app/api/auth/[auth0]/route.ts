export const dynamic = "force-dynamic";
// Auth0 v4 automatically mounts routes via middleware, so this route can be empty.
export function GET() {
  return new Response("Not Found", { status: 404 });
}


