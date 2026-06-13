import React from "react";
import { Cloud, Lock } from "lucide-react";

export default function EnterpriseInfrastructureSection() {
  return (
    <section className="w-full py-16 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Apple-style Headline */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black mb-6">
          Enterprise Infrastructure.
        </h2>

        <p className="text-xl text-gray-500 leading-relaxed font-medium mx-auto mb-12">
          Choose the deployment model that fits your security and compliance requirements.
        </p>

        {/* Simplified 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl mx-auto text-left">
          {/* Card 1: Multi Tenant Private Cloud */}
          <div className="p-8 rounded-3xl bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
              Multi Tenant Private Cloud
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium text-balance">
              The standard hosted version of our platform. Get started instantly
              with shared cloud performance, automatic scaling, and zero
              configuration.
            </p>
          </div>

          {/* Card 2: Single Tenant Private Cloud */}
          <div className="p-8 rounded-3xl bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
              Single Tenant Private Cloud
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium text-balance">
              A dedicated, single tenant private cloud managed entirely by our
              team. Get isolated workspaces and uptime SLAs with zero
              infrastructure overhead.
            </p>
          </div>


        </div>
      </div>
    </section>
  );
}
