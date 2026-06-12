import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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
  }
}

// Extend the Session interface to include the custom fields
declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      accessToken?: string;
    };
  }
}

const handler = NextAuth({
  debug: true,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "your-email@example.com",
        },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.accessToken) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/user/single-user`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${credentials.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            throw new Error("Invalid or expired session token.");
          }

          const response = await res.json();

          if (response.success && response.data) {
            return {
              email: response.data.email,
              token: credentials.accessToken,
              _id: response.data._id,
            } as ExtendedUser;
          }
          return null;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          },
        );

        if (!res.ok) {
          const errorData = await res.json();

          // The Inso backend globalErrorHandler returns { status: false, message: "..." }
          throw new Error(
            errorData.message || errorData.error || "Invalid credentials",
          );
        }

        const response = await res.json();

        if (response.success && response.data) {
          return {
            email: credentials?.email,
            token: response.data.accessToken,
            _id: response.data._id,
          } as ExtendedUser;
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account }) {
      // Handles initial login (Credentials or OAuth)
      if (user && account) {
        if (account.provider === "github" || account.provider === "google") {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  id: account.providerAccountId,
                  provider: account.provider,
                  avatar: user.image,
                  secret: process.env.SOCIAL_LOGIN_SECRET,
                }),
              },
            );

            if (res.ok) {
              const data = await res.json();

              if (data.success && data.data) {
                token.accessToken = data.data.accessToken;
                token._id = data.data._id;
              }
            }
          } catch (error) {
            console.error("Social login sync error:", error);
          }
        } else if (account.provider === "credentials") {
          token.accessToken = (user as ExtendedUser).token;
          token._id = (user as ExtendedUser)._id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        accessToken: token.accessToken,
        _id: token._id,
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
