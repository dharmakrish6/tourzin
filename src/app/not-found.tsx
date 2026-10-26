import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">404</p>
        <h1 className="h1 mt-2">This page took a wrong turn</h1>
        <p className="lead mt-3">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn btn-secondary">Home</Link>
          <Link href="/search/" className="btn btn-primary">Search Vehicles</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
