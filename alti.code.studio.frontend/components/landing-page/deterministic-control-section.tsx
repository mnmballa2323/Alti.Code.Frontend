"use client";

export default function DeterministicControlSection() {
  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="flex flex-col gap-8">
          <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Deterministic Output. <br />
            Absolute Security.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Most AI coding tools are unpredictable black boxes. Inso Code is{" "}
            <br className="hidden md:block" />
            built for enterprise engineering teams who demand absolute control.{" "}
            <br className="hidden md:block" />
            With native guardrails, deterministic instruction steering, and{" "}
            <br className="hidden md:block" />
            mandatory TDD workflows, our agents build robust production systems.
          </p>
        </div>
      </div>
    </section>
  );
}
