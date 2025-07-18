import axios from 'axios';

export class Api {
  constructor() {
    this.baseUrl = 'https://687a141fabb83744b7eb535d.mockapi.io/api';
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000
    });
  }

  async getProducts() {
    try {
      const response = await this.api.get('/products');
      return this.processProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  processProducts(products) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return products
      .filter(product => {
        return product.sortTypes && product.sortTypes.length > 0;
      })
      .map(product => {
        const productDate = new Date(product.dateAdded);
        const isNew = productDate > oneMonthAgo;
        
        return {
          ...product,
          sortTypes: isNew ? [...product.sortTypes, 'new'] : product.sortTypes
        };
      });
  }
} 