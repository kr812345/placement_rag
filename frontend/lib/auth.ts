import { AuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend the default session type to include custom fields like 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Example: Restrict login to a specific college domain
      // if (user.email && !user.email.endsWith("@yourcollege.edu")) {
      //   return false; // Deny access
      // }
      return true; // Allow access
    },
    async jwt({ token, user, account }) {
      // When the user signs in, you can store extra data in the JWT token
      if (user) {
        token.id = user.id;
        // token.role = user.role; // Example of adding roles
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access token or user ID
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
