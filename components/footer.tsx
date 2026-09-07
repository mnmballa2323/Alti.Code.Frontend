import Link from "next/link";

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-black z-50">
      <div className="flex justify-between items-center px-4 md:px-8 h-[80px] w-full pointer-events-none">
        {/* Left side: Headquarters */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-medium text-zinc-600 tracking-wider uppercase pointer-events-auto">
          <span>230 Park Ave, New York</span>
        </div>

        {/* Right side: Links */}
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-4 text-[12px] font-medium text-zinc-500 pointer-events-auto">
          <Link className="hover:text-white transition-colors" href="/">
            Home
          </Link>
          <span>&middot;</span>
          <Link className="hover:text-white transition-colors" href="/about">
            About
          </Link>
          <span>&middot;</span>
          <Link className="hover:text-white transition-colors" href="/contact">
            Contact
          </Link>
          <span>&middot;</span>
          <Link className="hover:text-white transition-colors" href="/privacy">
            Privacy
          </Link>
          <span>&middot;</span>
          <Link className="hover:text-white transition-colors" href="/terms">
            Terms
          </Link>
          <span>&middot;</span>
          <Link className="hover:text-white transition-colors" href="/cookies">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}
