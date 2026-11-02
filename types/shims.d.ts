// Next.js resolves `server-only` and CSS side-effect imports at build time;
// these declarations let TypeScript accept them during typecheck.
declare module 'server-only';
declare module '*.css';
