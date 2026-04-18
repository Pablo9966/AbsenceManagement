declare module "next/font/google" {
  export const Inter: (input: { subsets: string[]; variable?: string }) => { variable: string };
  export const Roboto: (input: { subsets: string[]; variable?: string; weight?: string[] }) => { variable: string };
}

declare module "*.css" {}
