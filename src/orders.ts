import { randomUUID } from 'node:crypto';

export interface OrderInput {
  product: string;
  quantity: number;
}

export interface Order extends OrderInput {
  id: string;
}

export function isOrderInput(value: unknown): value is OrderInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const { product, quantity } = value as Record<string, unknown>;
  return typeof product === 'string' && product.trim().length > 0
    && typeof quantity === 'number' && Number.isSafeInteger(quantity)
    && quantity > 0;
}

export function createOrderStore() {
  const orders = new Map<string, Order>();
  return {
    create(input: OrderInput): Order {
      const order = { id: randomUUID(), product: input.product.trim(), quantity: input.quantity };
      orders.set(order.id, order);
      return order;
    },
    find(id: string): Order | undefined {
      return orders.get(id);
    },
  };
}
