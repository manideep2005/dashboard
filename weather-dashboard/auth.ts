import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Track emails we've already welcomed (in-memory for this server instance)
const welcomedEmails = new Set<string>();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnSettings = nextUrl.pathname.startsWith("/settings");
      
      if ((isOnDashboard || isOnSettings) && !isLoggedIn) {
        return false;
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async signIn({ user }) {
      // Send welcome email on first sign-in
      if (user.email && user.name && !welcomedEmails.has(user.email)) {
        welcomedEmails.add(user.email);
        
        // Fire and forget via API route so we don't block Edge runtime
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        fetch(`${baseUrl}/api/welcome-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: user.name, email: user.email }),
        }).catch((e) => console.error("[Auth] Welcome email trigger failed", e));
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
});
