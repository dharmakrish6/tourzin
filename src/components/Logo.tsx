import Link from "next/link";

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg" aria-label="Tourzin home">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <rect width="40" height="40" rx="10" fill={light ? "#FFFFFF" : "#0B2744"} />
        <path d="M9 25V15.5A3.5 3.5 0 0 1 12.5 12H25l6 6.5V25H9Z" fill={light ? "#0B2744" : "#FFFFFF"} />
        <path d="M24 12v6.5h7" stroke="#F47A20" strokeWidth="2.4" fill="none" />
        <rect x="9" y="20" width="22" height="2.6" fill="#F47A20" />
        <circle cx="14" cy="26.5" r="3" fill="#F47A20" />
        <circle cx="26" cy="26.5" r="3" fill="#F47A20" />
      </svg>
      <span className={`text-[22px] font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        tour<span className="text-orange">zin</span>
      </span>
    </Link>
  );
}
