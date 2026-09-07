"use client";

/**
 * global-error.tsx — Global Error Boundary
 *
 * This catches errors that occur in the ROOT layout.tsx and its providers.
 * Without this file, any crash in Providers, SessionProvider, HeroUIProvider,
 * TRPCProvider, or other root-level components results in a blank white page
 * with no way to recover.
 *
 * NOTE: global-error MUST define its own <html> and <body> tags because
 * the root layout is not rendered when this error boundary is triggered.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 440,
            padding: "48px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            The application encountered an unexpected error. This has been
            logged.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details
              style={{
                textAlign: "left",
                marginBottom: 24,
                padding: "12px 16px",
                background: "#fff0f0",
                borderRadius: 8,
                border: "1px solid #fecaca",
                fontSize: 12,
                color: "#991b1b",
                wordBreak: "break-word",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                Error Details
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                }}
              >
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}
          <button
            style={{
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#111",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={reset}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
