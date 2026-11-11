// PostCSS n'est utilisé qu'en local quand Turbopack est indisponible (binaire natif bloqué par Windows) :
// TW_POSTCSS=1 next build --webpack. Sur Vercel, Turbopack traite Tailwind via next.config.ts.
const config = { plugins: process.env.TW_POSTCSS ? { "@tailwindcss/postcss": {} } : {} };
export default config;
