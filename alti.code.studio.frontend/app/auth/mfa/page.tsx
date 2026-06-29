"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function MFAPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we're fully unauthenticated, go back to login
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    // If MFA is not required, proceed
    if (status === "authenticated" && !session?.user?.mfaRequired) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const verifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({ code }),
        },
      );

      if (res.ok) {
        // Update the session token to clear the mfaRequired flag locally
        await update({ mfaRequired: false });
        toast.success("MFA Verified");
        router.push(callbackUrl);
      } else {
        const errorData = await res.json();

        toast.error(errorData.message || "Invalid MFA Code");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
      <div className="bg-[#18181b] p-8 rounded-xl border border-white/10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-zinc-400 text-sm">
            Your enterprise tenant requires MFA. Please enter your 6-digit code.
          </p>
        </div>

        <form className="space-y-6" onSubmit={verifyMFA}>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Verification Code
            </label>
            <input
              required
              className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              maxLength={6}
              placeholder="000000"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || code.length !== 6}
            type="submit"
          >
            {loading ? "Verifying..." : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}
