import Link from "next/link";

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg" aria-label="Tourzin home">
      {/* Logo art is white line work on transparent — needs the navy tile on light backgrounds */}
      <span className={`grid h-[34px] w-[34px] place-items-center rounded-[9px] ${light ? "" : "bg-navy"}`} aria-hidden>
        <img src="/img/logo.png" alt="" width={213} height={147} className={light ? "w-[34px]" : "w-[28px]"} />
      </span>
      <span className={`text-[22px] font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        tour<span className="text-orange">zin</span>
      </span>
    </Link>
  );
}
