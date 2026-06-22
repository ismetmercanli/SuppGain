import { getHealth } from './healthApi';
import { getProducts } from './productsApi';
import type { HealthResponse } from '../types/health';
import type { Product } from '../types/product';

export interface BasicConnectionResult {
  health: HealthResponse;
  products: Product[];
}

export async function runBasicConnectionCheck(): Promise<BasicConnectionResult> {
  const health = await getHealth();
  const products = await getProducts({ isActive: true });

  return {
    health,
    products,
  };
}

