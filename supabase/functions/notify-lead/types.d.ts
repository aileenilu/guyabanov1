declare module "jsr:@supabase/functions-js/edge-runtime.d.ts" {}

declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  env: {
    get(key: string): string | undefined;
  };
};
