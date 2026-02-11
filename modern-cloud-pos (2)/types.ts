
export interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  detail: string;
  image: string;
  category: string;
  status: 'In Stock' | 'Sold Out';
  createdAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum Category {
  ALL = 'All',
  COFFEE = 'Coffee',
  BAKERY = 'Bakery',
  DESSERT = 'Dessert',
  DRINK = 'Drinks'
}
