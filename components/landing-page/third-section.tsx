import Image from "next/image";

import FeatureVerticalStepper from "./FeaturesVerticalSteps";

function ThirdSection() {
  const items = [
    {
      title: "Intelligent Context",
      img: "/insocode1.png",
      subTitle: "Understands your entire codebase, not just individual files.",
      des: "Our AI platform provides complete visibility into your development ecosystem by connecting repositories, documentation, designs, and databases into a unified view. Find exactly what you need through semantic code search that understands intent, not just keywords. Every line of code generated follows your existing architectural patterns and style guides, while real-time repository synchronization ensures the AI stays current with every commit and deployment.",
      bulletsTitle: [
        "Universal Data Ingestion",
        " Semantic Code Search",
        "Architectural Awareness",
        "Live Repository Sync",
      ],
      bulletDesc: [
        "Connect repos, docs, designs, and databases. Your AI sees the full picture of your codebase.",
        "Find solutions by describing what you need, not just searching keywords and wasting your time.",
        "Generates code that follows your existing architecture patterns and style guides.",
        "Stays current with every commit and deployment on your cloud in real-time.",
      ],
    },
    {
      title: "Autonomous Development ",
      img: "/insocode2.png",
      subTitle: "From requirements to production, completely automated.",
      des: "Experience true end- automation that transforms requirements into production ready code without manual intervention. Our multi-step reasoning engine breaks down complex features, considers edge cases, and handles the complete development workflow including planning, coding, testing, documentation, and deployment to the cloud of your choice, while maintaining enterprise-grade security and scalability standards throughout the entire process.",
      bulletsTitle: [
        "Multi-Step Reasoning",
        "Full Development Workflow ",
        "Quality Assurance",
        "Safe Sandbox Testing",
      ],
      bulletDesc: [
        "Breaks down complex features and considers edge cases before coding and deploying.",
        "Plan, code, test, document, and deploy with end- automation for complete development.",
        "Built-in code reviews for security, performance, documentation, optimization, and best practice.",
        " Tests all changes in isolated environments before deploying to cloud and going live.",
      ],
    },
    {
      title: "Developer Experience ",
      img: "/insocode3.png",
      subTitle: "Tools that make coding feel effortless.",
      des: "Eliminate debugging headaches with an AI assistant that analyzes logs, traces issues across your entire stack, and implements fixes automatically. Documentation stays current without effort through auto-generated READMs, API docs, and guides that evolve with your code. The platform learns from your team's code reviews and design decisions, creating meaningful commits, detailed pull requests, and deployment notifications that keep everyone informed.",
      bulletsTitle: [
        "Debug & Fix Assistant",
        "Smart Documentation ",
        "Team Knowledge Capture",
        "Code Actions",
      ],
      bulletDesc: [
        " Analyzes logs, traces issues, and implements fixes across your entire development stack.",
        " Auto generates and maintains READMEs, API docs, and guides for smart documentation.",
        "Learns from your code reviews and design decisions to optimize the perfomance.",
        " Creates meaningful commits, detailed PRs, and deployment notifications automatically.",
      ],
    },
    {
      title: "Enterprise Integration ",
      img: "/insocode4.png",
      subTitle: "Secure, scalable, and works with your existing tools.",
      des: "Built on claude technology with intelligent routing for optimal speed and performance across many native tool integrations including GitHub, Jira, GCP, and Kubernetes. Enterprise-grade security features SOC 2 compliance, encrypted storage, and flexible on-premises deployment options. Simple configuration lets you define standards, approval workflows, and deployment rules that align perfectly with your organization's governance and special requirements.",
      bulletsTitle: [
        "Select Model",
        "Tool Integrations",
        "Enterprise Security",
        "Governance Controls",
      ],
      bulletDesc: [
        "Choose between powerful models for optimal speed and maximum development efficiency.",
        "Native connections to GitHub, Jira, GCP, Kubernetes, and your entire toolchain.",
        "SOC 2 compliance, encrypted storage, and on-premises deployment options for enterprise.",
        "Define standards, approval workflows, and deployment rules with simple configuration.",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center" id="security">
      {items.map((item, index) => {
        // Determine background color: even indices (0,2) = white, odd indices (1,3) = black
        const isEven = index % 2 === 0;
        const bgColor = isEven ? "bg-white" : "bg-black";
        const textColor = isEven ? "text-black" : "text-black";
        const opacityClass = isEven ? "opacity-60" : "opacity-70";
        const subtitleOpacity = isEven ? "opacity-50" : "opacity-60";

        return (
          <div
            key={index}
            className={`w-full ${bgColor} ${textColor} py-10 lg:py-20`}
          >
            <div className="wrapper">
              <div
                className={`flex justify-between max-lg:flex-wrap items-start w-full`}
              >
                <div
                  className={`flex flex-col justify-between h-full w-full lg:w-[50%] ${index === 1 || index === 3 ? "order-1 max-lg:mt-10" : "max-lg:mb-10"}`}
                >
                  <div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-secondary font-bold text-2xl lg:text-[32px]">
                        {item.title}
                      </h3>
                      <p className={`${opacityClass} font-normal text-base`}>
                        {item.subTitle}
                      </p>
                    </div>
                    <p
                      className={`font-normal text-sm ${subtitleOpacity} mt-5`}
                    >
                      {item.des}
                    </p>
                    <div className="w-full h-[150px]">
                      <Image
                        alt={item.title}
                        className="mt-5 h-full w-full object-cover rounded-lg"
                        height={200}
                        src={item.img}
                        width={670}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full lg:w-[50%] flex rounded-[12px] overflow-hidden ${index === 1 || index === 3 ? "justify-start" : "justify-end"}`}
                >
                  <FeatureVerticalStepper
                    hideProgressBars
                    className={`lg:max-w-sm ${isEven ? "" : "[--step-color:white] [--step-fg-color:black] [--active-border-color:white] [--inactive-border-color:rgba(255,255,255,0.3)] [--inactive-color:rgba(255,255,255,0.7)]"}`}
                    defaultStep={4}
                    stepClassName={`border rounded-lg ${isEven ? "border-gray-200 bg-gray-50 text-black" : "border-white bg-white text-black"}`}
                    steps={
                      item.bulletsTitle && item.bulletDesc
                        ? item.bulletsTitle.map((title, idx) => ({
                            title,
                            description: item.bulletDesc[idx] || "",
                          }))
                        : [
                            {
                              title: "Create an account",
                              description:
                                "Laying a robust foundation is key to ensuring the stability and growth of any project.",
                            },
                            {
                              title: "Company Information",
                              description:
                                "Please describe your business, including its main services and target market.",
                            },
                            {
                              title: "Choose Address",
                              description:
                                "Please choose the official address for your business or residence from the list provided",
                            },
                            {
                              title: "Payment",
                              description:
                                "Complete the registration process to finalize your account setup.",
                            },
                          ]
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ThirdSection;
