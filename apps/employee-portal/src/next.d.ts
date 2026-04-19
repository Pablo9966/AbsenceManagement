declare module "next/font/google" {
  export const Inter: (input: { subsets: string[]; variable?: string }) => { variable: string };
  export const Roboto: (input: { subsets: string[]; variable?: string; weight?: string[] }) => { variable: string };
}

declare module "next/navigation" {
  export const redirect: (href: string) => never;
}

declare module "next/headers" {
  export const cookies: () => Promise<{
    get: (name: string) => { value: string } | undefined;
  }>;
}

declare module "*.css" {}
