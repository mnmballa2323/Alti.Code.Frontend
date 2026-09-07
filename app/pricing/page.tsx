import Navbar from "@/components/navbar";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-[30vh] md:pt-[38vh] w-full relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-8 w-full">
          <div className="flex flex-col items-center gap-2 relative top-2 md:top-4 w-full">
            <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter leading-[1.0] text-center">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] tracking-tight text-white whitespace-nowrap">
                $99 Per User Per Month
              </span>
            </h1>
            <div className="max-w-5xl flex flex-col items-center text-zinc-400 text-lg font-normal leading-relaxed mt-2 px-4 text-center">
              <p>
                A single, transparent enterprise tier. Inso code orchestrates
                your autonomous agent swarms, while all
                <br className="hidden md:block" /> underlying inference and
                compute costs are securely billed directly to your existing
                hyperscaler agreements.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
