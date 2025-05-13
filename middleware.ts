import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  "/",
  "/leaderboard(.*)",
  "/authors(.*)",
  "/workflow(.*)",
]); // Corrected pattern
// const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // const isAdminUser = auth().userId === process.env.ADMIN_USER_ID;
  // if (isAdminRoute(req) && !isAdminUser) {
  //   return NextResponse.redirect(new URL('/', req.url));
  // }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// export default clerkMiddleware(async (auth, req) => {
//   if (!isPublicRoute(req)) {
//     await auth.protect()
//   }
// })

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
