import Navbar from "@/components/navbar";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

export default function AzurePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-[20vh] w-full relative z-10 text-center px-4 sm:px-6 lg:px-8 pb-32">
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-12 w-full">
          <div className="flex flex-col items-center gap-4 relative w-full">
            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2" />
              Azure Native Execution Plane
            </div>
            <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter leading-[1.1] text-center">
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] tracking-tight text-white">
                Enterprise AI for Code on Azure
              </span>
            </h1>
            <p className="max-w-3xl text-zinc-400 text-xl font-normal leading-relaxed mt-4 px-4 text-center">
              Our platform operates a massive, highly secure, fully sovereign AI
              Execution Plane utilizing the absolute cutting edge of Microsoft
              Azure. Every agent, every model, and every deployment is strictly
              isolated and natively orchestrated inside the Azure ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-12 text-left">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Azure AI Foundry & OpenAI
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Utilizing dedicated Cognitive Services deployments of GPT-4
                Turbo securely within Azure AI Foundry. Models are locked within
                the VNet boundaries with zero external network routing,
                protecting your proprietary code logic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Azure Kubernetes Service (AKS)
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                AI swarms execute natively on AKS clusters configured with
                Calico network policies. This provides immense horizontal
                scaling across Azure's global regions while maintaining strict
                container-level isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Azure AI Search (Vector RAG)
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We heavily leverage Azure AI Search's native vector indexing to
                build immense semantic mappings of massive enterprise codebases,
                supplying instantaneous contextual RAG to our agent nodes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Azure Logic Apps Orchestrator
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Agent routing, dependency mapping, and autonomous swarm
                communication are managed seamlessly by Azure Logic Apps,
                creating highly durable, event-driven orchestration without
                external platform reliance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Cosmos DB Global State
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Agent state, conversational memory, and complex execution graphs
                are persisted into Azure Cosmos DB (GlobalDocumentDB) with
                Session-level consistency for robust, globally distributed
                operational memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xl font-semibold text-white">
                Azure Key Vault (Premium HSM)
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We utilize the Premium tier of Azure Key Vault to access
                physical HSMs. All deployable software artifacts are
                cryptographically signed natively inside Azure to meet the
                strictest compliance regimes.
              </p>
            </div>
          </div>

          <div className="w-full p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl mt-8 flex flex-col md:flex-row items-center justify-between text-left gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4">
                Zero-Trust Managed Identities
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                The entire Azure environment operates under a strict Zero-Trust
                architecture. We rely entirely on Azure User-Assigned Managed
                Identities to grant explicit, granular access between AKS,
                Cosmos DB, and AI Foundry. Coupled with comprehensive Azure
                Private Endpoints across all PaaS services and protected by
                Azure API Management (APIM), the execution plane is an
                impregnable, air-gapped fortress.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
