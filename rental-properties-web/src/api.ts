import axios from "axios";
import type { Page, Property, Reservation } from "./types";

// URL base da nossa API (Spring Boot)
export const api = axios.create({
  baseURL: "http://localhost:8080",
});

// --------- PROPERTIES ---------

// Lista imóveis com paginação simples
export async function fetchProperties(page = 0, size = 10) {
  const response = await api.get<Page<Property>>("/properties", {
    params: { page, size },
  });

  return response.data;
}

// Cria um novo imóvel
export interface CreatePropertyPayload {
  title: string;
  type: string;
  location: string;
  nightlyPrice: number;
  maxGuests: number;
  description?: string;
}

export async function createProperty(payload: CreatePropertyPayload) {
  const response = await api.post<Property>("/properties", payload);
  return response.data;
}

// --------- RESERVATIONS ---------

export interface CreateReservationPayload {
  propertyId: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;   // "2026-01-20"
  checkOut: string;  // "2026-01-25"
}

export async function createReservation(payload: CreateReservationPayload) {
  const response = await api.post<Reservation>("/reservations", payload);
  return response.data;
}

// Lista reservas de um imóvel específico
export async function fetchReservationsByProperty(propertyId: number) {
  const response = await api.get<Reservation[]>(
    `/reservations/by-property/${propertyId}`
  );
  return response.data;
}
