export const formatPrice = (price, withSpaces = false) => {
  if (withSpaces) {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽';
  }
  return price + ' ₽';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}; 