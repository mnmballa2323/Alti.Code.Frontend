"use client";

function HeroSection() {
 return (
 <div className="min-h-screen flex flex-col relative overflow-hidden">
 {/* Top 20% - Black background with white title */}
 <div className="h-[24vh] lg:h-[20vh] bg-black flex items-center justify-center px-4">
 <div className="text-center flex flex-col h-full pt-12 lg:pt-12 items-center justify-start">
 <h1 className="font-bold text-[28px] md:text-[36px] lg:text-[42px] font-secondary leading-tight text-black">
 Secure AI IDE for Enterprise Teams
 </h1>
 <p className="font-normal text-center text-lg lg:text-2xl text-black/80 mt-3">
 Build, review, and ship code faster with an AI powered IDE that runs
 in a private cloud
 </p>
 </div>
 </div>

 {/* Bottom 80% - Video background */}
 <div className="h-[75vh] mt-6 relative overflow-hidden">
 <video
 autoPlay
 loop
 muted
 playsInline
 className="absolute inset-0 w-full h-full object-cover"
 >
 <source src="/hero.mp4" type="video/mp4" />
 {/* <source src="/path/to/your/video.webm" type="video/webm" /> */}
 Your browser does not support the video tag.
 </video>

 {/* Optional overlay for better text visibility if you want to add content here */}
 <div className="absolute inset-0 bg-black/20" />

 {/* Optional content area over video */}
 <div className="absolute inset-0 flex items-center justify-center z-10">
 <div className="text-center text-black">
 {/* You can add additional content here if needed */}
 {/* <Button className="bg-white/20 backdrop-blur-sm text-black hover:bg-white/30 transition-all duration-300">
 Get Started
 </Button> */}
 </div>
 </div>
 </div>
 </div>
 );
}

export default HeroSection;
