"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem("tourzin:cookie-ok"));
    } catch {}
  }, []);
  if (!show) return null;
  const ok = () => {
    try {
      localStorage.setItem("tourzin:cookie-ok", "1");
    } catch {}
    setShow(false);
  };
  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="card animate-fade p-4 text-sm shadow-xl">
        <p className="text-ink">
          We use essential storage and basic analytics to improve Tourzin. See our{" "}
          <Link href="/privacy/" className="text-blue underline">Privacy Policy</Link>.
        </p>
        <button onClick={ok} className="btn btn-blue btn-sm mt-3">Got it</button>
      </div>
    </div>
  );
}
