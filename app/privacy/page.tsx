import Navbar from "@/components/navbar";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-32 pb-32 w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-bold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 mb-12 text-sm uppercase tracking-widest">
            Effective Date: August 26, 2026 &nbsp;|&nbsp; Last Updated: August
            26, 2026
          </p>

          <div className="flex flex-col gap-10 text-zinc-400 text-base md:text-lg font-normal leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Scope and Applicability
              </h2>
              <p>
                This Privacy Policy ("Policy") describes how Alti Code Studio Inc.
                ("Alti Code Studio," "we," "us," or "our") collects, uses, stores, and
                shares information when you access our website, platform, and
                autonomous software engineering services (collectively, the
                "Services"). This Policy applies to all users, including
                enterprise clients utilizing our sovereign agent architectures
                across our Triple Cloud Native Execution Planes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. The Principle of Data Sovereignty & Zero-Retention
              </h2>
              <p className="mb-4">
                Alti Code Studio is fundamentally engineered around the principle of
                absolute data sovereignty. We recognize that your source code,
                infrastructure architecture, and proprietary algorithms are your
                most critical intellectual property.
              </p>
              <p>
                Through our Google Cloud Platform Native Sovereign architecture, our autonomous
                agent swarms are deployed natively across our GCP Execution Planes (Cloud Run & GKE).
                This guarantees your codebase never crosses unauthorized hyperscalers or unverified networks.{" "}
                <strong>
                  Alti Code Studio operates a strict Zero-Retention Policy.
                </strong>
                While your code is processed within our secure, isolated cloud
                environments, we do not persistently store, log, or cache your
                source code, database schemas, or proprietary business logic.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Information We Collect
              </h2>
              <p className="mb-4">
                While we do not access your proprietary code, we do collect
                specific metadata required to provision and maintain the
                Services:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Account & Billing Information:</strong> To establish
                  your enterprise account, we collect names, corporate email
                  addresses, billing addresses, and payment processing details.
                </li>
                <li>
                  <strong>Identity & Authentication Data:</strong> Cryptographic
                  tokens, IP addresses, and user-agent strings utilized
                  exclusively for securing session state and preventing
                  unauthorized API access.
                </li>
                <li>
                  <strong>System Telemetry & Health Metrics:</strong> We collect
                  anonymized, aggregated performance telemetry (e.g., agent
                  execution latency, API request volume, compute utilization).
                  This telemetry contains zero customer payload data and is used
                  solely to monitor the health of the routing mesh. Enterprise
                  clients may opt-out of telemetry collection via their
                  deployment manifest.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Legal Basis for Processing (GDPR & CCPA)
              </h2>
              <p>
                Our processing of personal data is strictly grounded in the
                necessity to perform our contractual obligations to you
                (providing the Services), complying with our legal obligations,
                and pursuing our legitimate business interests (such as ensuring
                the cryptographic security of the platform and preventing
                fraud). We do not engage in algorithmic profiling or automated
                decision-making based on personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                5. Third-Party Subprocessors & LLM Infrastructure
              </h2>
              <p className="mb-4">
                To facilitate the cognitive capabilities of our autonomous
                agents, Alti Code Studio routes requests exclusively through Google Cloud Vertex AI
                and Gemini enterprise models under zero-data-retention agreements.
              </p>
              <p>
                <strong>Zero-Training Guarantee:</strong> We hold enterprise-grade
                contractual agreements guaranteeing that zero data routed through
                Alti Code Studio will ever be used to train, retrain, or fine-tune
                foundation models. Your infrastructure interactions
                remain strictly ephemeral.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                6. Data Security Measures
              </h2>
              <p>
                We employ military-grade, industry-standard security measures
                including AES-256 encryption at rest, TLS 1.3 for data in
                transit, strict Role-Based Access Control (RBAC), and continuous
                SOC 2 Type II compliance auditing. In the highly unlikely event
                of a data breach affecting the minimal account metadata we do
                hold, we will notify affected administrators within 72 hours of
                discovery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                7. Your Data Subject Rights
              </h2>
              <p>
                Depending on your jurisdiction (e.g., California, EU, UK), you
                may possess the right to request access to, correction of, or
                deletion of your personal data. You may also have the right to
                restrict processing or request data portability. To exercise
                these rights, please submit a formal request to our legal
                privacy team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                8. Contact Information
              </h2>
              <p>
                For legal inquiries, compliance audits, or to exercise your
                privacy rights, please contact our Data Protection Officer (DPO)
                and legal counsel at: <br />
                <br />
                <strong className="text-white">Email:</strong>{" "}
                contact@insocode.com <br />
                <strong className="text-white">Headquarters:</strong> 230 Park
                Avenue, New York, NY
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
