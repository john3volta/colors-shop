import { formatPrice } from '../../scripts/utils/helpers.js';

export class CartModal {
  constructor() {
    this.modal = document.querySelector('.cart-modal');
    this.content = this.modal?.querySelector('.cart-modal__content');
    this.closeBtn = this.modal?.querySelector('.cart-modal__close');
    this.clearBtn = this.modal?.querySelector('.cart-modal__clear');
    this.checkoutBtn = this.modal?.querySelector('.cart-modal__checkout');
    this.itemsContainer = this.modal?.querySelector('.cart-modal__items');
    this.countElement = this.modal?.querySelector('.cart-modal__count');
    this.totalElement = this.modal?.querySelector('.cart-modal__total-price');
    
    this.cartItems = [];
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    this.bindEvents();
    this.loadCartFromStorage();
    this.updateCartDisplay();
    this.notifyHeader();
  }
  
  // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
  bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.close());
    
    this.clearBtn?.addEventListener('click', () => this.clearCart());
    
    this.checkoutBtn?.addEventListener('click', () => this.checkout());
    
    if (window.app?.overlay) {
      window.app.overlay.overlay?.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    this.itemsContainer?.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.classList.contains('cart-modal__quantity-btn')) {
        const action = target.dataset.action;
        const itemElement = target.closest('.cart-modal__item');
        const itemId = itemElement?.dataset.itemId;
        
        if (itemId) {
          if (action === 'increase') {
            this.increaseQuantity(itemId);
          } else if (action === 'decrease') {
            this.decreaseQuantity(itemId);
          }
        }
      }
      
      if (target.closest('.cart-modal__remove')) {
        const itemElement = target.closest('.cart-modal__item');
        const itemId = itemElement?.dataset.itemId;
        
        if (itemId) {
          this.removeItem(itemId);
        }
      }
    });
  }
  
  // ===== УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ =====
  open() {
    if (!this.modal) return;
    
    document.body.style.overflow = 'hidden';
    
    if (window.app?.overlay) {
      window.app.overlay.show();
    }
    
    this.modal.classList.add('cart-modal--active');
    this.isOpen = true;
  }
  
  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('cart-modal--active');
    this.isOpen = false;
    document.body.style.overflow = '';
    
    if (window.app?.overlay) {
      window.app.overlay.hide();
    }
  }
  
  // ===== УПРАВЛЕНИЕ ТОВАРАМИ =====
  addItem(product) {
    const productId = `${product.category}-${product.brand}-${product.name}`;
    const existingItem = this.cartItems.find(item => 
      `${item.category}-${item.brand}-${item.name}` === productId
    );
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        ...product,
        id: productId,
        quantity: 1
      });
    }
    
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.notifyHeader();
  }
  
  removeItem(itemId) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.notifyHeader();
  }
  
  increaseQuantity(itemId) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity += 1;
      this.saveCartToStorage();
      this.updateCartDisplay();
      this.notifyHeader();
    }
  }
  
  decreaseQuantity(itemId) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.saveCartToStorage();
      this.updateCartDisplay();
      this.notifyHeader();
    } else if (item && item.quantity === 1) {
      this.removeItem(itemId);
    }
  }
  
  clearCart() {
    this.cartItems = [];
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.notifyHeader();
  }
  
  // ===== ОБНОВЛЕНИЕ UI =====
  updateCartDisplay() {
    this.renderItems();
    this.updateCount();
    this.updateTotal();
  }
  
  renderItems() {
    if (!this.itemsContainer) return;
    
    if (this.cartItems.length === 0) {
      this.itemsContainer.innerHTML = `
        <div class="cart-modal__empty">
          <p>Корзина пуста</p>
        </div>
      `;
      return;
    }
    
    this.itemsContainer.innerHTML = this.cartItems.map(item => {
      const fullName = [item.category, item.brand, item.name]
        .filter(Boolean)
        .map(function(part, index, array) {
          if (index === 1 && array.length > 2) {
            return part + ',';
          }
          return part;
        })
        .join(' ');
      
      return `
        <div class="cart-modal__item" data-item-id="${item.id}">
          <div class="cart-modal__item-info">
            <div class="cart-modal__item-image">
              <img src="${item.image}" alt="${fullName}">
            </div>
            <div class="cart-modal__item-content">
              <h3 class="cart-modal__item-title">${fullName}</h3>
              <div class="cart-modal__item-price">${formatPrice(item.price, true)}</div>
            </div>
          </div>
          <div class="cart-modal__item-actions">
            <div class="cart-modal__item-controls">
              <button class="cart-modal__quantity-btn" type="button" data-action="decrease">-</button>
              <span class="cart-modal__quantity">${item.quantity}</span>
              <button class="cart-modal__quantity-btn" type="button" data-action="increase">+</button>
            </div>
            <button class="cart-modal__remove" type="button" aria-label="Удалить товар">
              <svg class="cart-modal__remove-icon">
                <use href="#icon-x"></use>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  updateCount() {
    if (!this.countElement) return;
    
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const itemWord = this.getItemWord(totalItems);
    this.countElement.textContent = `${totalItems} ${itemWord}`;
  }
  
  updateTotal() {
    if (!this.totalElement) return;
    
    const total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalElement.textContent = formatPrice(total, true);
  }
  
  // ===== УТИЛИТЫ =====
  getItemWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'товаров';
    }
    
    if (lastDigit === 1) {
      return 'товар';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'товара';
    } else {
      return 'товаров';
    }
  }
  
  // ===== СОХРАНЕНИЕ ДАННЫХ =====
  saveCartToStorage() {
    const cartData = {
      version: '1.0',
      items: this.cartItems,
      timestamp: Date.now()
    };
    localStorage.setItem('cart', JSON.stringify(cartData));
  }
  
  loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        
        if (cartData.version === '1.0' && cartData.items) {
          this.cartItems = cartData.items;
        } else {
          this.cartItems = [];
          localStorage.removeItem('cart');
        }
      } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
        this.cartItems = [];
        localStorage.removeItem('cart');
      }
    }
  }
  
  // ===== ДЕЙСТВИЯ =====
  checkout() {
    if (this.cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }
    
    // Здесь можно добавить логику оформления заказа
    alert('Переход к оформлению заказа...');
    console.log('Оформление заказа:', this.cartItems);
  }
  
  // ===== ГЕТТЕРЫ =====
  getCartItems() {
    return this.cartItems;
  }
  
  getCartTotal() {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  getCartCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  // ===== СОБЫТИЯ =====
  notifyHeader() {
    const count = this.getCartCount();
    const event = new CustomEvent('cart:cartUpdated', {
      detail: { 
        items: this.cartItems,
        count: count 
      }
    });
    document.dispatchEvent(event);
  }
}