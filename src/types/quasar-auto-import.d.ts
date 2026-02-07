// Quasar auto-import types
import type { App } from 'vue';

declare module '#q-app/wrappers' {
  export type QuasarConfigContext = unknown;
  export function defineConfig<TContext = QuasarConfigContext, TResult = unknown>(
    fn: (ctx: TContext) => TResult,
  ): TResult;
  export function defineBoot<TContext = { app: App }, TResult = unknown>(
    fn: (ctx: TContext) => TResult,
  ): TResult;
  export function defineRouter<TContext = QuasarConfigContext, TResult = unknown>(
    fn: (ctx: TContext) => TResult,
  ): TResult;
  export function defineStore<TContext = QuasarConfigContext, TResult = unknown>(
    fn: (ctx: TContext) => TResult,
  ): TResult;
}
