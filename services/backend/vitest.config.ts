import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,ts,mjs,mts}', 'src/**/*.spec.{js,ts,mjs,mts}'],
    environment: 'node',
  },
});
