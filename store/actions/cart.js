export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

export function addToCart(product) {
  return { type: ADD_TO_CART, product: product };
}

export function removeFromCart(productId) {
  return { type: REMOVE_FROM_CART, pid: productId };
}