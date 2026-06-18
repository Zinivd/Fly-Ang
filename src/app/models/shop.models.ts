export interface CategoryItem {
  name: string;
  img: string;
}

export interface ProductItem {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  rating: number;
  review: number;
  sp: number;
  mrp: number;
}

export interface CollectionItem {
  name: string;
  img: string;
}

export interface ReviewItem {
  id: string | number;
  name: string;
  heading: string;
  review: number;
  date: string;
  content: string;
}