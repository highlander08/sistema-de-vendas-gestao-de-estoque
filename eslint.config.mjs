import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Configuração base com extensões do Next.js
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['src/generated/**'], // Substitui o .eslintignore
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
    },
  },
  // Incorpora extensões do Next.js
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Sobrescreve regras para arquivos gerados pelo Prisma
  {
    files: ['src/generated/**/*.js', 'src/generated/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Adicionado para cobrir {} e Function
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
    },
  },
];

export default eslintConfig;