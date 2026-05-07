import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/api/mobile/account", "/((?!_next|.*\\..*|_vercel|api|trpc).*)"],
};
