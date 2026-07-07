export interface CategoryItem {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
  order_level: number;
  banner_path: string | null;
  icon_path: string | null;
  cover_path: string | null;
  created_at: string;
  updated_at: string;
  banner_url: string | null;
  icon_url: string | null;
  cover_url: string | null;
}

export interface ProductColor {
  id: number;
  name: string;
  code: string;
}

export interface ProductItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  rating: number;
  review: number;
  sp: number;
  mrp: number;
  category?: any;
  color_variants?: any[];
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

export interface ReelItem {
  id: string | number;
  title: string;
  description: string;
  file_name: string;
  file_size: string;
  video_url: string;
  file_type: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}