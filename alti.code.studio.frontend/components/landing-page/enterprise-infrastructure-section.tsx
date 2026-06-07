import React from "react";
import { Cloud, ShieldCheck, Server, ArrowRight } from "lucide-react";

export default function EnterpriseInfrastructureSection() {
  return (
    <section className="w-full py-24 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        
        {/* Apple-style Headline */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black mb-6">
          Enterprise Infrastructure.
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-500 w-full font-medium tracking-tight mb-16 leading-relaxed">
          Deploy where and how you want. Contrast our fully managed private cloud<br className="hidden md:block" /> with native deployment inside your own secure VPC.
        </p>

        {/* Deployment Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-left">
          
          {/* Card 1: Managed Private Cloud */}
          <div className="flex flex-col justify-between p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
                Managed Private Cloud
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium mb-6">
                Get the full power of autonomous engineering hosted in a dedicated, single-tenant private cloud. We handle the provisioning, scaling, and maintenance while keeping your workspace completely isolated.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  Isolated single-tenant workspace
                </li>
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  Zero infrastructure maintenance overhead
                </li>
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  Guaranteed uptime SLAs
                </li>
              </ul>
            </div>
            
            <a 
              href="#contact" 
              className="inline-flex items-center text-black font-semibold hover:underline group"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Card 2: Self-Hosted VPC */}
          <div className="flex flex-col justify-between p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
                Self-Hosted VPC
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium mb-6">
                Deploy agents natively inside your own AWS, Azure, or GCP cloud environment. Complete data sovereignty—your code execution, credentials, and database connections never leave your network perimeter.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  100% data sovereignty & local execution
                </li>
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  Integration with existing enterprise IAM
                </li>
                <li className="flex items-center text-gray-600 font-medium">
                  <ShieldCheck className="w-5 h-5 text-black mr-2 flex-shrink-0" />
                  No external egress for strict compliance
                </li>
              </ul>
            </div>

            {/* Cloud Badges */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-600">AWS</span>
                <span className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-600">Azure</span>
                <span className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-600">GCP</span>
              </div>
              <a 
                href="#docs" 
                className="inline-flex items-center text-black font-semibold hover:underline group"
              >
                Read Setup Docs
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
