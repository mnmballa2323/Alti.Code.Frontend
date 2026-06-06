"use client";

export default function EnterpriseConnectorsSection() {
  const providers = [
    "Amazon Web Services", "Google Cloud Platform", "Microsoft Azure", "DigitalOcean", 
    "Linode", "Vultr", "Heroku", "Vercel", "Netlify", "Render", "Railway", "Fly.io", 
    "Supabase", "Firebase", "Cloudflare", "Oracle Cloud", "IBM Cloud", "Alibaba Cloud", 
    "Tencent Cloud", "Scaleway", "Hetzner", "OVHcloud", "UpCloud", "Equinix Metal", 
    "Fastly", "Akamai", "Snowflake", "Databricks", "MongoDB Atlas", "PlanetScale", 
    "Neon", "Vanta", "Datadog", "New Relic", "Splunk", "Elastic", "PagerDuty", 
    "Twilio", "SendGrid", "Stripe", "Auth0", "Clerk", "Okta", "Cloudinary"
  ];

  return (
    <section className="w-full py-32 bg-[#F5F5F7] text-black px-4 sm:px-6 lg:px-8 border-t border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-16">
        
        <div className="flex flex-col gap-6 max-w-3xl">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
            Universal Ecosystem
          </h2>
          <h3 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-tight">
            44 Cloud Providers. <br />Zero Friction.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Alti Code Studio isn&apos;t a walled garden. Your swarm connects directly to the absolute best 
            cloud infrastructure on the planet. From hyper-scalers to specialized databases, we integrate everywhere.
          </p>
        </div>

        {/* 44 Cloud Providers Grid */}
        <div className="w-full max-w-6xl mt-8">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {providers.map((provider, idx) => (
              <div 
                key={idx} 
                className="px-5 py-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 font-medium text-sm hover:text-black hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-default"
              >
                {provider}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
