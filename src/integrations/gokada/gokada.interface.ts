export interface CreateGokadaOrderDto {
  // api_key: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  pickup_name: string;
  pickup_phone: string;
  pickup_email: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_email: string;
  description: string;
}

export interface CreateGokadaOrderResponse {
  order_id: string;
  distance: number;
  time: number;
  fare: number;
}

export interface CancelGokadaOrderDto {
  // api_key: string;
  order_id: string;
}

export interface EstimateGokadaOrderDto {
  // api_key: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_latitude: number;
  delivery_longitude: number;
}

export interface EstimateGokadaOrderResponse {
  distance: number;
  time: number;
  fare: number;
}
