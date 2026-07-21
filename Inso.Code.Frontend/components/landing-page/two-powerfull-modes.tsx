function PowerFullModes() {
  const items = [
    {
      title: "Chat Mode",
      subTitle: "Document intelligence and knowledge management",
      des: "Create a private AI assistant that knows everything about your organization. Upload any digital files and your custom chatbot learns from your specific content, answering questions in natural language with perfect citations. Get an AI assistant that actually understands your business, your processes, your data, and your organizational knowledge for your entire corporation.",
      img: "/assets/svgs/shield.svg",
    },
    {
      title: "Code Mode",
      subTitle: "Code analysis and software development support",
      des: "Analyze your private codebases, technical documentation, and development resources with complete security. Upload source code, API documentation, technical specs, and development guides. Query your code repositories, understand complex systems, and accelerate development workflows while keeping your entire proprietary code completely private and secure.",
      img: "/assets/svgs/brain.svg",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center py-10 max-2xl:px-5 lg:py-20">
      <div className="flex flex-col gap-5">
        <h2 className="font-secondary text-[#000] font-bold text-[32px] lg:text-5xl leading-[56px] text-center">
          Powered by Leading AI Models
        </h2>
        <p className="font-normal lg:text-lg text-[#000] leading-[24px] text-center ">
          Choose from the best AI models for every coding task, giving you the
          flexibility and power to code how you want.
        </p>
      </div>
    </div>
  );
}

export default PowerFullModes;
