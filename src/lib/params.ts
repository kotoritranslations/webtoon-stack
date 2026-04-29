// src/lib/params.ts
// Helper para manejar params como Promise en Next.js 15

import { use } from 'react';

/**
 * Hook para resolver params en Next.js 15
 * Los params ahora son Promise y necesitan ser resueltos
 */
export function useParams<T>(params: Promise<T>): T {
  return use(params);
}

/**
 * Componente wrapper para páginas que usan params
 */
export async function resolveParams<T>(params: Promise<T>): Promise<T> {
  return await params;
}