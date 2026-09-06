export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  fabric_options: string[];
  size_options: string[];
  pattern_options: string[];
  featured: boolean;
  stock: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_value: number;
  expires_at?: string | null;
  active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  name: string;
  discount_percent: number;
  scope: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  created_at: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  fabric?: string;
  size?: string;
  pattern?: string;
  is_custom?: boolean;
  custom_design_id?: string;
  custom_image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string | null;
  status: "processing" | "tailoring" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  shipping_address: ShippingAddress;
  created_at: string;
}

export interface CustomDesign {
  id: string;
  user_id: string;
  user_email: string;
  fabric: string;
  size: string;
  pattern: string;
  image_url: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}
