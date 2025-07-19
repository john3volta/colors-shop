import { Api } from '../../scripts/api/api.js';
import { formatPrice } from '../../scripts/utils/helpers.js';

export class Catalog {
  constructor(container) {
    this.container = container;
    this.products = [];
    this.filteredProducts = [];
    this.activeFilters = new Set();
    this.sortType = 'expensive';
    this.currentPage = 0;
    this.productsPerPage = 15;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadProducts();
  }
  
  // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
  bindEvents() {
    this.container.querySelectorAll('.catalog__filter-label').forEach(label => {
      label.addEventListener('click', e => {
        const checkbox = e.target.closest('.catalog__filter-item').querySelector('.catalog__filter-input');
        checkbox.checked = !checkbox.checked;
        this.handleFilterChange(checkbox);
      });
    });
    
    this.initSortDropdown();
    this.initMobileFilters();
    
    this.container.querySelector('.catalog__list')?.addEventListener('wheel', this.handleScroll.bind(this));
  }
  
  handleFilterChange(checkbox) {
    const filterItem = checkbox.closest('.catalog__filter-item');
    const filterText = filterItem.querySelector('.catalog__filter-text').textContent.trim();
    const filterType = this.getFilterType(filterText);
    const filterLabel = filterItem.querySelector('.catalog__filter-label');
    
    if (checkbox.checked) {
      this.activeFilters.add(filterType);
      filterLabel.classList.add('catalog__filter-label--active');
    } else {
      this.activeFilters.delete(filterType);
      filterLabel.classList.remove('catalog__filter-label--active');
    }
    
    this.renderProducts();
  }
  
  getFilterType(text) {
    const filterMap = {
      'Новинки': 'new',
      'Есть в наличии': 'stock', 
      'Контрактные': 'contract',
      'Эксклюзивные': 'exclusive',
      'Распродажа': 'sale'
    };
    return filterMap[text] || text.toLowerCase();
  }
  
  // ===== ЗАГРУЗКА ДАННЫХ =====
  async loadProducts() {
    try {
      const api = new Api();
      this.products = await api.getProducts();
      this.filteredProducts = [...this.products];
      this.initializeActiveFilters();
      this.renderProducts();
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  }
  
  initializeActiveFilters() {
    const checkedInputs = this.container.querySelectorAll('.catalog__filter-input:checked');
    
    checkedInputs.forEach(input => {
      const filterItem = input.closest('.catalog__filter-item');
      const filterTextElement = filterItem.querySelector('.catalog__filter-text');
      const filterText = filterTextElement.textContent.trim();
      const filterType = this.getFilterType(filterText);
      
      this.activeFilters.add(filterType);
      
      const filterLabel = filterItem.querySelector('.catalog__filter-label');
      filterLabel.classList.add('catalog__filter-label--active');
    });
  }
  
  // ===== ФИЛЬТРАЦИЯ И СОРТИРОВКА =====
  filterProducts() {
    if (this.activeFilters.size === 0) {
      this.filteredProducts = [...this.products];
      return;
    }
    
    this.filteredProducts = this.products.filter(product => {
      if (!product.sortTypes) {
        return false;
      }
      
      const activeFiltersArray = Array.from(this.activeFilters);
      
      for (let i = 0; i < activeFiltersArray.length; i++) {
        const filterType = activeFiltersArray[i];
        if (!product.sortTypes.includes(filterType)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  sortProducts() {
    if (this.sortType === 'expensive') {
      this.filteredProducts.sort((a, b) => {
        return b.price - a.price;
      });
    } else if (this.sortType === 'cheap') {
      this.filteredProducts.sort((a, b) => {
        return a.price - b.price;
      });
    } else if (this.sortType === 'new') {
      this.filteredProducts.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateB - dateA;
      });
    } else if (this.sortType === 'popular') {
      this.filteredProducts.sort((a, b) => {
        const ordersA = a.ordersCount || 0;
        const ordersB = b.ordersCount || 0;
        return ordersB - ordersA;
      });
    }
  }
  
  // ===== РЕНДЕРИНГ =====
  renderProducts() {
    this.filterProducts();
    this.sortProducts();
    
    const list = this.container.querySelector('.catalog__list');
    const count = this.container.querySelector('.catalog__count');
    
    if (list) {
      list.innerHTML = '';
      this.currentPage = 0;
      this.loadMoreProducts();
    }
    
    if (count) {
      count.textContent = `${this.filteredProducts.length} ТОВАРОВ`;
    }
  }
  
  loadMoreProducts() {
    const list = this.container.querySelector('.catalog__list');
    if (!list) return;
    
    const startIndex = this.currentPage * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
    
    productsToShow.forEach(product => {
      const productCard = this.createProductCard(product);
      list.appendChild(productCard);
    });
    
    this.currentPage++;
  }
  
  handleScroll(e) {
    const list = this.container.querySelector('.catalog__list');
    if (!list) return;
    
    const rect = list.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    if (mouseX >= rect.left && mouseX <= rect.right && 
        mouseY >= rect.top && mouseY <= rect.bottom) {
      
      const totalLoaded = this.currentPage * this.productsPerPage;
      if (totalLoaded < this.filteredProducts.length) {
        this.loadMoreProducts();
      }
    }
  }
  
  // ===== СОЗДАНИЕ КАРТОЧЕК ТОВАРОВ =====
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'catalog__card';
    
    const category = product.category;
    const brand = product.brand;
    const name = product.name;
    const image = product.image;
    const hoverImage = product.hoverImage;
    const price = product.price;
    
    const fullName = [category, brand, name]
      .filter(Boolean)
      .map(function(part, index, array) {
        if (index === 1 && array.length > 2) {
          return part + ',';
        }
        return part;
      })
      .join(' ');
    
    card.innerHTML = `
      <div class="catalog__card-image">
        <img src="${image}" alt="${fullName}" class="catalog__card-main-image">
        ${hoverImage ? `<img src="${hoverImage}" alt="${fullName}" class="catalog__card-hover-image">` : ''}
      </div>
      <div class="catalog__card-content">
        <div class="catalog__card-name">${fullName}</div>
        <div class="catalog__card-price-row">
          <div class="catalog__card-price">${formatPrice(price)}</div>
          <button class="catalog__card-add-to-cart" type="button" aria-label="Добавить в корзину">
            +
          </button>
        </div>
      </div>
    `;
    
    const addButton = card.querySelector('.catalog__card-add-to-cart');
    addButton.addEventListener('click', function() {
      this.addToCart({ 
        category: category, 
        brand: brand, 
        name: name, 
        price: price,
        image: image 
      });
    }.bind(this));
    
    return card;
  }
  
  // ===== КОРЗИНА =====
  addToCart(product) {
    const event = new CustomEvent('cart:add', {
      detail: { product }
    });
    document.dispatchEvent(event);
  }
  
  // ===== СОРТИРОВКА =====
  initSortDropdown() {
    const dropdown = this.container.querySelector('.catalog__sort');
    const trigger = this.container.querySelector('.catalog__sort-trigger');
    const options = this.container.querySelectorAll('.catalog__sort-option');
    
    if (!dropdown || !trigger) return;
    
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      this.toggleSortDropdown(dropdown);
    }.bind(this));
    
    options.forEach(function(option) {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = option.dataset.value;
        const text = option.textContent;
        
        this.sortType = value;
        this.container.querySelector('.catalog__sort-text').textContent = text;
        this.closeSortDropdown(dropdown);
        this.renderProducts();
      }.bind(this));
    }.bind(this));
    
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target) && dropdown.classList.contains('catalog__sort-dropdown--open')) {
        this.closeSortDropdown(dropdown);
      }
    }.bind(this));
  }
  
  toggleSortDropdown(dropdown) {
    if (dropdown.classList.contains('catalog__sort-dropdown--open')) {
      this.closeSortDropdown(dropdown);
    } else {
      this.openSortDropdown(dropdown);
    }
  }
  
  openSortDropdown(dropdown) {
    dropdown.classList.add('catalog__sort-dropdown--open');
    
    if (window.overlay) {
      window.overlay.show();
    }
  }
  
  closeSortDropdown(dropdown) {
    dropdown.classList.remove('catalog__sort-dropdown--open');
    if (window.overlay) {
      window.overlay.hide();
    }
  }
  
  // ===== МОБИЛЬНЫЕ ФИЛЬТРЫ =====
  initMobileFilters() {
    const filtersBtn = this.container.querySelector('.catalog__filters-btn');
    const filters = this.container.querySelector('.catalog__filters');
    
    if (!filtersBtn || !filters) {
      return;
    }
    
    filtersBtn.addEventListener('click', function() {
      this.toggleMobileFilters();
    }.bind(this));
    
    if (window.overlay && window.overlay.overlay) {
      window.overlay.overlay.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const dropdown = this.container.querySelector('.catalog__sort');
        if (dropdown && dropdown.classList.contains('catalog__sort-dropdown--open')) {
          this.closeSortDropdown(dropdown);
        }
          
        const filters = this.container.querySelector('.catalog__filters');
        if (filters && filters.classList.contains('catalog__filters--open')) {
          this.closeMobileFilters();
        }
      }.bind(this));
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && filters.classList.contains('catalog__filters--open')) {
        this.closeMobileFilters();
      }
    }.bind(this));
    
    //swipe
    let startY = 0;
    let currentY = 0;
    
    filters.addEventListener('touchstart', function(e) {
      startY = e.touches[0].clientY;
    });
    
    filters.addEventListener('touchmove', function(e) {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        filters.classList.add('catalog__filters--dragging');
        filters.style.transform = `translateY(${deltaY}px)`;
      }
    });
    
    filters.addEventListener('touchend', function(e) {
      const deltaY = currentY - startY;
      
      filters.classList.remove('catalog__filters--dragging');
      
      if (deltaY > 150) {
        this.closeMobileFilters();
      } else {
        filters.style.transform = '';
      }
    }.bind(this))     
  }
  
  toggleMobileFilters() {
    const filters = this.container.querySelector('.catalog__filters');
    
    if (filters.classList.contains('catalog__filters--open')) {
      this.closeMobileFilters();
    } else {
      this.openMobileFilters();
    }
  }
  
  openMobileFilters() {
    const filters = this.container.querySelector('.catalog__filters');
    
    document.body.style.overflow = 'hidden';

    if (window.overlay) {
      window.overlay.show();
    }

    filters.classList.add('catalog__filters--mobile');
    filters.classList.add('catalog__filters--open');
  }
  
  closeMobileFilters() {
    const filters = this.container.querySelector('.catalog__filters');
    if (filters) {
      filters.classList.remove('catalog__filters--open');
      filters.classList.remove('catalog__filters--mobile');
      filters.classList.remove('catalog__filters--dragging');
      filters.style.transform = '';
    }

    document.body.style.overflow = '';
    
    if (window.overlay) {
      window.overlay.hide();
    }
  }
}