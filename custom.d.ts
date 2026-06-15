// This file tells TypeScript how to handle imports for files ending in .module.css
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// You can add declarations for other asset types here too
// For example, for non-module CSS files if you import them for side effects
declare module "*.css";
