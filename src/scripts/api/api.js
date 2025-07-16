export class Api {
  constructor() {
    this.baseUrl = 'https://mockapi.io/projects/your-project-id';
  }

  async getProducts() {
    return [
      {
        id: 1,
        name: 'Краска Wallquest, Brownsone MS90102',
        price: 6000,
        image: 'img/products/MS90102.png',
        type: 'new'
      },
      {
        id: 2,
        name: 'Краска Wallquest, Brownsone MS90102',
        price: 4800,
        image: 'img/products/MS90102-1.png',
        type: 'stock'
      }
    ];
  }
} 