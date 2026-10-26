// Plain JS config (not .ts) so hosting build pipelines such as Hostinger's
// can load it without TypeScript transpilation.
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the build (public_html/) is plain HTML/CSS/JS.
  output: "export",
  // With output: "export", distDir sets the export folder (default: out/).
  distDir: "public_html",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
