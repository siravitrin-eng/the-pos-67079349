
import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  // Added missing required properties (unit, detail, status) and renamed 'name' to 'title' to match the Product interface
  { id: '1', title: 'Espresso', price: 45, category: Category.COFFEE, image: 'https://picsum.photos/seed/espresso/200/200', unit: 'Cup', detail: 'Rich espresso', status: 'In Stock' },
  { id: '2', title: 'Latte', price: 65, category: Category.COFFEE, image: 'https://picsum.photos/seed/latte/200/200', unit: 'Cup', detail: 'Creamy latte', status: 'In Stock' },
  { id: '3', title: 'Cappuccino', price: 60, category: Category.COFFEE, image: 'https://picsum.photos/seed/cappuccino/200/200', unit: 'Cup', detail: 'Classic cappuccino', status: 'In Stock' },
  { id: '4', title: 'Croissant', price: 55, category: Category.BAKERY, image: 'https://picsum.photos/seed/croissant/200/200', unit: 'Piece', detail: 'Buttery croissant', status: 'In Stock' },
  { id: '5', title: 'Chocolate Cake', price: 85, category: Category.DESSERT, image: 'https://picsum.photos/seed/cake/200/200', unit: 'Slice', detail: 'Rich chocolate cake', status: 'In Stock' },
  { id: '6', title: 'Blueberry Muffin', price: 45, category: Category.BAKERY, image: 'https://picsum.photos/seed/muffin/200/200', unit: 'Piece', detail: 'Fresh blueberry muffin', status: 'In Stock' },
  { id: '7', title: 'Iced Tea', price: 40, category: Category.DRINK, image: 'https://picsum.photos/seed/tea/200/200', unit: 'Glass', detail: 'Refreshing iced tea', status: 'In Stock' },
  { id: '8', title: 'Orange Juice', price: 50, category: Category.DRINK, image: 'https://picsum.photos/seed/juice/200/200', unit: 'Glass', detail: 'Freshly squeezed orange juice', status: 'In Stock' },
  { id: '9', title: 'Cheesecake', price: 95, category: Category.DESSERT, image: 'https://picsum.photos/seed/cheesecake/200/200', unit: 'Slice', detail: 'Smooth cheesecake', status: 'In Stock' },
  { id: '10', title: 'Mocha', price: 70, category: Category.COFFEE, image: 'https://picsum.photos/seed/mocha/200/200', unit: 'Cup', detail: 'Chocolate flavored coffee', status: 'In Stock' },
];

export const CATEGORIES = Object.values(Category);
