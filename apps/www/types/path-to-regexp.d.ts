declare module "next/dist/compiled/path-to-regexp" {
  export interface MatchResult {
    path: string;
    index: number;
    params: Record<string, string | string[]>;
  }

  export interface MatchOptions {
    decode?: (value: string) => string;
    [key: string]: unknown;
  }

  export function match(
    pattern: string,
    options?: MatchOptions
  ): (pathname: string) => MatchResult | false;
}
