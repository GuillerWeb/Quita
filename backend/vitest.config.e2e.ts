import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Os testes e2e usam o banco de dev no Supabase (rede): tempo maior.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
