export type PropertyStatus = "AVAILABLE" | "BLOCKED" | "INACTIVE";

export interface Property {
  id: number;
  title: string;
  type: string;
  location: string;
  status: PropertyStatus;
  nightlyPrice: number;
  maxGuests: number;
  description: string | null;
}

// Tipos relacionados a reservas (reservations)

export type ReservationStatus = "BOOKED" | "CANCELLED" | "COMPLETED";

export interface Reservation {
  id: number;
  propertyId: number;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;   // vamos trabalhar como string (ISO) no front
  checkOut: string;
  totalPrice: number;
  status: ReservationStatus;
}

// Tipo genérico para respostas paginadas
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;   // tamanho da página
  number: number; // página atual (0-based)
}