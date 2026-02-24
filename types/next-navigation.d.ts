/**
 * Fallback types for next/navigation when node_modules isn't visible to the IDE.
 */
declare module "next/navigation" {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  };
  export function useSearchParams(): URLSearchParams;
  export function usePathname(): string;
}
