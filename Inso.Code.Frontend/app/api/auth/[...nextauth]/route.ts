import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import KeycloakProvider from "next-auth/providers/keycloak";

// Extend User to include the custom token and _id
interface ExtendedUser extends User {
  _id?: string;
  token?: string;
  role?: string;
  tenantId?: string;
  mfaRequired?: boolean;
}

// Extend the JWT interface to include the custom fields
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number; // unix ms — when the access token expires
    role?: string;
    tenantId?: string;
    mfaRequired?: boolean;
    error?: string; // set to 'RefreshAccessTokenError' when refresh fails
  }
}

// Extend the Session interface to include the custom fields
declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      accessToken?: string;
      role?: string;
      tenantId?: string;
      mfaRequired?: boolean;
      error?: string;
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
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer: process.env.KEYCLOAK_ISSUER ?? "",
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
                Authorization: `Bearer ${credentials.accessToken}`,
                "Content-Type": "application/json",
              },
            },
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
            role: response.data.role,
            tenantId: response.data.tenantId,
            mfaRequired: response.data.mfaRequired || false,
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
      // ── Initial sign-in: populate token from backend response ──────────────
      if (user && account) {
        if (["github", "google"].includes(account.provider)) {
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
                token.refreshToken = data.data.refreshToken;
                token._id = data.data._id;
                token.role = data.data.role;
                token.tenantId = data.data.tenantId;
                token.mfaRequired = data.data.mfaRequired || false;
                // Access tokens expire in 1 hour — store expiry so we can refresh proactively
                token.tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 min (5 min early)
              }
            }
          } catch (error) {
            console.error("Social login sync error:", error);
          }
        } else if (account.provider === "credentials") {
          token.accessToken = (user as ExtendedUser).token;
          token.refreshToken = (user as ExtendedUser & { refreshToken?: string }).refreshToken;
          token._id = (user as ExtendedUser)._id;
          token.role = (user as ExtendedUser).role;
          token.tenantId = (user as ExtendedUser).tenantId;
          token.mfaRequired = (user as ExtendedUser).mfaRequired;
          token.tokenExpiry = Date.now() + 55 * 60 * 1000;
        }
        return token;
      }

      // ── Subsequent calls: silently refresh if token is near expiry ──────────
      const isExpiredOrNearExpiry =
        token.tokenExpiry && Date.now() > token.tokenExpiry;

      if (!isExpiredOrNearExpiry) {
        // Token still valid — return as-is
        return token;
      }

      // Token expired — attempt refresh
      if (!token.refreshToken) {
        // No refresh token stored (e.g. old session before this change) — force re-login
        return { ...token, error: "RefreshAccessTokenError" };
      }

      try {
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          },
        );

        const refreshData = await refreshRes.json();

        if (!refreshRes.ok || !refreshData.success || !refreshData.data?.accessToken) {
          console.error("[NextAuth] Token refresh failed:", refreshData.message);
          return { ...token, error: "RefreshAccessTokenError" };
        }

        return {
          ...token,
          accessToken: refreshData.data.accessToken,
          refreshToken: refreshData.data.refreshToken ?? token.refreshToken,
          tokenExpiry: Date.now() + 55 * 60 * 1000,
          error: undefined,
        };
      } catch (err) {
        console.error("[NextAuth] Token refresh network error:", err);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.user = {
        accessToken: token.accessToken,
        _id: token._id,
        role: token.role,
        tenantId: token.tenantId,
        mfaRequired: token.mfaRequired,
        // Surface the error so client-side code can redirect to login
        error: token.error,
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
