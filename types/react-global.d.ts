/**
 * Fallback "react" and "react/jsx-runtime" module types when node_modules isn't visible to the IDE.
 * Global React/JSX are in jsx-global.d.ts.
 */
declare module "react" {
  export type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | { type: unknown; props: unknown; key?: string | null }
    | ReactNode[];
  export const createElement: (type: unknown, props?: unknown, ...children: unknown[]) => unknown;
  export const Fragment: unknown;
  export default unknown;
}

declare module "react/jsx-runtime" {
  export const jsx: (type: unknown, props: unknown, key?: string) => unknown;
  export const jsxs: (type: unknown, props: unknown, key?: string) => unknown;
  export const Fragment: unknown;
}
