import Navbar from "@/components/navbar";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-[30vh] md:pt-[38vh] w-full relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto gap-8 w-full">
          <div className="flex flex-col items-center gap-2 relative top-2 md:top-4 w-full">
            <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter leading-[1.0] text-center">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] tracking-tight text-white whitespace-nowrap">
                We Are Alti Code Studio
              </span>
            </h1>
            <div className="max-w-6xl flex flex-col items-center text-zinc-400 text-lg font-normal leading-relaxed mt-2 px-4 text-center">
              <p>
                We are a team of systems engineers, AI researchers, and security
                architects solving the limits of human engineering.
                <br className="hidden md:block" /> By deploying sovereign agent
                swarms natively on your cloud of choice, we orchestrate
                autonomous intelligence.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
