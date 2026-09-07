import Navbar from "@/components/navbar";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-32 pb-32 w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-bold tracking-tight text-white mb-4">
            Cookies & Tracking Policy
          </h1>
          <p className="text-zinc-500 mb-12 text-sm uppercase tracking-widest">
            Effective Date: August 26, 2026 &nbsp;|&nbsp; Last Updated: August
            26, 2026
          </p>

          <div className="flex flex-col gap-10 text-zinc-400 text-base md:text-lg font-normal leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Introduction
              </h2>
              <p>
                Inso Code Inc. ("Inso Code") respects your privacy. This Cookies
                Policy explains what cookies are, how we use them within our
                enterprise platform, and your rights to control their usage. As
                an enterprise security-first organization, our use of cookies is
                aggressively restricted compared to consumer web applications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. What Are Cookies?
              </h2>
              <p>
                Cookies are small encrypted text files placed on your device by
                your browser. They are utilized by web infrastructure to persist
                state, authenticate sessions, and secure network boundaries
                across stateless HTTP requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Strict Restriction of Third-Party Targeting
              </h2>
              <p className="font-semibold text-white mb-2">We Do Not Track.</p>
              <p>
                Inso Code expressly prohibits the use of third-party advertising
                cookies, retargeting pixels, or behavioral cross-site trackers
                on our authenticated dashboards or public marketing surfaces.
                Your institutional interest in sovereign AI architectures is
                highly confidential and will not be monetized or shared with
                data brokers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Types of Cookies We Deploy
              </h2>
              <p className="mb-4">
                We exclusively deploy cookies that fall into the following
                critical categories:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong className="text-white">
                    Strictly Necessary / Authentication Cookies:
                  </strong>
                  These are cryptographic JSON Web Tokens (JWT) and session
                  identifiers required to grant you secure access to the
                  dashboard and authorize your command over the agent swarms.
                  Without these cookies, the platform cannot function.
                </li>
                <li>
                  <strong className="text-white">
                    Security & Anti-CSRF Cookies:
                  </strong>
                  Tokens deployed to prevent Cross-Site Request Forgery (CSRF)
                  attacks, throttle malicious bot traffic, and enforce Web
                  Application Firewall (WAF) policies.
                </li>
                <li>
                  <strong className="text-white">Functional Cookies:</strong>
                  Ephemeral local storage utilized to persist UI preferences,
                  such as retaining your dark mode state or preserving local
                  draft commands before they are dispatched to the swarm.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                5. Managing and Revoking Consent
              </h2>
              <p>
                You maintain absolute control over your browser's cookie
                policies. You may configure your browser settings to
                automatically decline all cookies or to notify you when a cookie
                is issued.
              </p>
              <p className="mt-4">
                <em>Notice:</em> Because our platform relies entirely on secure
                cryptographic tokens to authenticate infrastructure commands,
                electing to block "Strictly Necessary" cookies will inherently
                sever your ability to log into the Inso Code dashboard or
                interface with your deployed swarms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                6. Policy Modifications
              </h2>
              <p>
                We reserve the right to amend this policy at our discretion to
                reflect technical architecture shifts or to comply with emerging
                international data protection regulations. Material changes will
                be communicated via the dashboard prior to taking effect.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
