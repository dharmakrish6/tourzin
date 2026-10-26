// Plain JS config (not .ts) so hosting build pipelines such as Hostinger's
// can load it without TypeScript transpilation.
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the build (out/) is plain HTML/CSS/JS.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
