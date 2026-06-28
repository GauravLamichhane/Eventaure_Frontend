// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

const NAV = [
  {
    label: "Explore",
    links: [
      { to: "/events", label: "Browse events" },
      { to: "/events?type=online", label: "Online events" },
      { to: "/events?type=physical", label: "Physical events" },
      { to: "/events?time=this-week", label: "This week" },
    ],
  },
  {
    label: "Organizers",
    links: [
      { to: "/events/new", label: "Create an event" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard/registrations", label: "Manage registrations" },
      { to: "/dashboard/waitlist", label: "Waitlist settings" },
    ],
  },
  {
    label: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/privacy", label: "Privacy policy" },
      { to: "/terms", label: "Terms of service" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

const SOCIALS = [
  { icon: "ti-brand-x", label: "Twitter / X", href: "#" },
  { icon: "ti-brand-linkedin", label: "LinkedIn", href: "#" },
  { icon: "ti-brand-github", label: "GitHub", href: "#" },
  { icon: "ti-brand-instagram", label: "Instagram", href: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // wire to your backend newsletter endpoint later
    console.log("subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="bg-[#fafafa] border-t border-[#ebebeb] px-6 pt-12">
      {/* Main grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-4 gap-10 mb-10">
        {/* Brand column */}
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 no-underline w-fit">
            <div className="w-7 h-7 bg-[#171717] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[13px] font-semibold font-mono">
                E
              </span>
            </div>
            <span className="text-[15px] font-semibold text-[#171717] tracking-tight">
              eventaure
            </span>
          </Link>
          <p className="text-[13px] text-[#8f8f8f] leading-relaxed mt-2.5 max-w-[220px]">
            Discover and manage events across Nepal. From workshops to
            conferences, all in one place.
          </p>

          {/* Newsletter */}
          <div className="mt-4">
            <p className="text-xs text-[#8f8f8f] mb-1.5">Get event updates</p>
            <form onSubmit={handleSubscribe} className="flex gap-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 h-[34px] px-2.5 text-[13px] border border-[#ebebeb] rounded-md bg-white text-[#171717] placeholder:text-[#a1a1a1] focus:outline-none focus:ring-1 focus:ring-black/20 min-w-0"
              />
              <button
                type="submit"
                className="h-[34px] px-3.5 bg-[#171717] text-white text-[13px] font-medium rounded-md border-none cursor-pointer hover:bg-[#333] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        {NAV.map(({ label, links }) => (
          <div key={label}>
            <p className="text-[11px] font-semibold text-[#171717] uppercase tracking-[0.08em] font-mono mb-3.5">
              {label}
            </p>
            <div className="flex flex-col gap-2">
              {links.map(({ to, label: text }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-[13px] text-[#4d4d4d] no-underline leading-none hover:text-[#171717] transition-colors"
                >
                  {text}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-5xl mx-auto border-t border-[#ebebeb] py-5 flex items-center justify-between">
        <span className="text-xs text-[#8f8f8f]">
          © {new Date().getFullYear()} Eventaure. All rights reserved.
        </span>
        <div className="flex items-center gap-1">
          {SOCIALS.map(({ icon, label, href }) => (
            <a
              key={icon}
              href={href}
              aria-label={label}
              className="w-8 h-8 border border-[#ebebeb] rounded-md bg-white flex items-center justify-center text-[#4d4d4d] no-underline hover:bg-[#f2f2f2] hover:text-[#171717] transition-colors"
            >
              <i
                className={`ti ${icon}`}
                style={{ fontSize: 15 }}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
