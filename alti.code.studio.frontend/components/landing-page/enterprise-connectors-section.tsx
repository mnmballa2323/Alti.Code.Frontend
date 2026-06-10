"use client";

import { SiKubernetes, SiDigitalocean, SiSnowflake } from "react-icons/si";
import React from "react";

const OrbitRing = ({
  size,
  duration,
  reverse,
  items,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  items: React.ReactNode[];
}) => {
  const radius = size / 2;

  return (
    <div
      className={`absolute rounded-full border border-zinc-800 border-dashed animate-spin`}
      style={{
        width: size,
        height: size,
        animationDuration: `${duration}s`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {items.map((item, i) => {
        const angle = (i / items.length) * 2 * Math.PI;
        const x = (radius + radius * Math.cos(angle)).toFixed(4);
        const y = (radius + radius * Math.sin(angle)).toFixed(4);

        return (
          <div
            key={i}
            className="absolute -ml-6 -mt-6 w-12 h-12"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <div
              className="w-full h-full bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 animate-spin-reverse"
              style={{
                animationDuration: `${duration}s`,
                animationDirection: reverse ? "reverse" : "normal",
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function EnterpriseConnectorsSection() {
  return (
    <section className="w-full py-32 bg-black text-white px-4 sm:px-6 lg:px-8 border-t border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-8 lg:justify-between">
        {/* Left Side: Text */}
        <div className="flex flex-col gap-6 max-w-2xl lg:w-[50%] z-10 text-center lg:text-left mx-auto lg:mx-0">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            66 Cloud Connections. Zero Friction. All Power.
          </h3>
          <p className="text-xl text-zinc-400 leading-relaxed font-medium">
            Inso Code isn&apos;t a walled garden. Your swarm connects directly
            to the absolute best cloud infrastructure on the planet. From
            hyper-scalers to specialized providers, we integrate everywhere, for
            frictionless deployments.
          </p>
        </div>

        {/* Right Side: Orbital Ecosystem (Now visually on Left) */}
        <div className="relative w-full lg:w-[50%] h-[600px] flex items-center justify-center lg:-translate-x-16 scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes spin-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            .animate-spin-reverse {
              animation: spin-reverse linear infinite;
            }
          `,
            }}
          />

          {/* Central Hub */}
          <div className="absolute z-30 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform duration-500 cursor-pointer border border-gray-200">
            <img
              alt="Inso Code"
              className="w-12 h-12 object-contain"
              src="/inso-logo-black.png"
            />
          </div>

          {/* Inner Orbit: Hyperscalers */}
          <OrbitRing
            duration={25}
            items={[
              <img
                key="aws"
                alt="AWS"
                className="w-6 h-6 object-contain"
                src="/assets/cloud-logos/aws.svg"
              />,
              <img
                key="gcp"
                alt="Google Cloud"
                className="w-6 h-6 object-contain"
                src="/assets/cloud-logos/gcp.svg"
              />,
              <img
                key="azure"
                alt="Azure"
                className="w-6 h-6 object-contain"
                src="/assets/cloud-logos/azure.svg"
              />,
            ]}
            size={260}
          />

          {/* Middle Orbit: Databases & Core Infra */}
          <OrbitRing
            reverse
            duration={40}
            items={[
              <SiKubernetes
                key="kubernetes"
                className="w-6 h-6 text-[#326CE5]"
              />,
              <SiDigitalocean
                key="digitalocean"
                className="w-6 h-6 text-[#0080FF]"
              />,
              <div
                key="oracle"
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg
                  className="w-6 h-auto"
                  fill="none"
                  viewBox="0 0 231 30"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M99.61,19.52h15.24l-8.05-13L92,30H85.27l18-28.17a4.29,4.29,0,0,1,7-.05L128.32,30h-6.73l-3.17-5.25H103l-3.36-5.23m69.93,5.23V0.28h-5.72V27.16a2.76,2.76,0,0,0,.85,2,2.89,2.89,0,0,0,2.08.87h26l3.39-5.25H169.54M75,20.38A10,10,0,0,0,75,.28H50V30h5.71V5.54H74.65a4.81,4.81,0,0,1,0,9.62H58.54L75.6,30h8.29L72.43,20.38H75M14.88,30H32.15a14.86,14.86,0,0,0,0-29.71H14.88a14.86,14.86,0,1,0,0,29.71m16.88-5.23H15.26a9.62,9.62,0,0,1,0-19.23h16.5a9.62,9.62,0,1,1,0,19.23M140.25,30h17.63l3.34-5.23H140.64a9.62,9.62,0,1,1,0-19.23h16.75l3.38-5.25H140.25a14.86,14.86,0,1,0,0,29.71m69.87-5.23a9.62,9.62,0,0,1-9.26-7h24.42l3.36-5.24H200.86a9.61,9.61,0,0,1,9.26-7h16.76l3.35-5.25h-20.5a14.86,14.86,0,0,0,0,29.71h17.63l3.35-5.23h-20.6"
                    fill="#F80000"
                  />
                </svg>
              </div>,
              <div
                key="ibm"
                className="w-6 h-6 flex items-center justify-center text-[#0530AD]"
              >
                <svg
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>IBM</title>
                  <path d="M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z" />
                </svg>
              </div>,
              <div
                key="firebase"
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 600 600"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M213.918 560.499c23.248 9.357 48.469 14.909 74.952 15.834 35.84 1.252 69.922-6.158 100.391-20.234-36.537-14.355-69.627-35.348-97.869-61.448-18.306 29.31-45.382 52.462-77.474 65.848Z"
                    fill="#FF9100"
                  />
                  <path
                    d="M291.389 494.66c-64.466-59.622-103.574-145.917-100.269-240.568.108-3.073.27-6.145.46-9.216a166.993 166.993 0 0 0-36.004-5.241 167.001 167.001 0 0 0-51.183 6.153c-17.21 30.145-27.594 64.733-28.888 101.781-3.339 95.611 54.522 179.154 138.409 212.939 32.093-13.387 59.168-36.51 77.475-65.848Z"
                    fill="#FFC400"
                  />
                  <path
                    d="M291.39 494.657c14.988-23.986 24.075-52.106 25.133-82.403 2.783-79.695-50.792-148.251-124.942-167.381-.19 3.071-.352 6.143-.46 9.216-3.305 94.651 35.803 180.946 100.269 240.568Z"
                    fill="#FF9100"
                  />
                  <path
                    d="M308.231 20.858C266 54.691 232.652 99.302 212.475 150.693c-11.551 29.436-18.81 61.055-20.929 94.2 74.15 19.13 127.726 87.686 124.943 167.38-1.058 30.297-10.172 58.39-25.134 82.404 28.24 26.127 61.331 47.093 97.868 61.447 73.337-33.9 125.37-106.846 128.383-193.127 1.952-55.901-19.526-105.724-49.875-147.778-32.051-44.477-159.5-194.36-159.5-194.36Z"
                    fill="#DD2C00"
                  />
                </svg>
              </div>,
              <SiSnowflake
                key="snowflake"
                className="w-6 h-6 text-[#29B5E8]"
              />,
            ]}
            size={420}
          />
        </div>
      </div>
    </section>
  );
}
