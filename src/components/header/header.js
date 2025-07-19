import { CartModal } from '../cart/cart.js';

export class Header {
  constructor() {
    this.cartModal = null;
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.cartModal = new CartModal();
  }
  
  // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
  bindEvents() {
    const cartButton = document.querySelector('.header__action-btn[aria-label="Корзина"]');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        this.openCart();
      });
    }
    
    const burgerButton = document.querySelector('.header__burger');
    if (burgerButton) {
      burgerButton.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }
    
    document.addEventListener('cart:add', (event) => {
      this.cartModal.addItem(event.detail.product);
    });
    
    document.addEventListener('cart:cartUpdated', (event) => {
      const { count } = event.detail;
      this.updateCartDisplay(count);
    });
  }
  
  // ===== ДЕЙСТВИЯ С КОРЗИНОЙ =====
  openCart() {
    this.cartModal.open();
  }
  
  // ===== МОБИЛЬНОЕ МЕНЮ =====
  toggleMobileMenu() {
    const header = document.querySelector('.header');
    const burger = document.querySelector('.header__burger');
    
    header?.classList.toggle('header--mobile-menu-open');
    burger?.classList.toggle('active');
  }
  
  // ===== ОБНОВЛЕНИЕ UI =====
  updateCartDisplay(count = 0) {
    const cartButton = document.querySelector('.header__action-btn[aria-label="Корзина"]');
    const cartIcon = cartButton?.querySelector('.header__icon');
    const cartCounter = cartButton?.querySelector('.header__cart-counter');
    
    if (!cartButton || !cartIcon || !cartCounter) return;
    
    if (count > 0) {
      cartIcon.style.display = 'none';
      cartCounter.style.display = 'flex';
      cartCounter.textContent = count;
    } else {
      cartIcon.style.display = 'block';
      cartCounter.style.display = 'none';
    }
  }
} 