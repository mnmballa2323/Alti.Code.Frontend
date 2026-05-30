import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend User to include the custom token and _id
interface ExtendedUser extends User {
  _id?: string;
  token?: string;
}

// Extend the JWT interface to include the custom fields
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    accessToken?: string;
    // email: string;
  }
}

// Extend the Session interface to include the custom fields
declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      // email: string;
      accessToken?: string;
    };
  }
}

const handler = NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "your-email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Invalid credentials");
        }

        const response = await res.json();
        // console.log(response,"check res for login")

        if (response.success && response.data) {
          return {
            // email: response.data.email,
            token: response.data.accessToken,
            _id: response.data._id, // Add _id from the backend response
          } as ExtendedUser;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // token.email = user.email ?? "";
        token.accessToken = (user as ExtendedUser).token;
        token._id = (user as ExtendedUser)._id; // Add _id to JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        // email: token.email,
        accessToken: token.accessToken,
        _id: token._id, // Add _id to session
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };