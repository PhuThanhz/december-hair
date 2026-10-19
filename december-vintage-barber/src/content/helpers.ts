import type { Branch, Service } from "./types";

export const findBranch = (branches: Branch[], id?: string | null) => (id ? branches.find((b) => b.id === id) : undefined);
export const findService = (services: Service[], id?: string | null) => (id ? services.find((s) => s.id === id) : undefined);

export const directionsUrl = (b: Branch) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.coords[1]},${b.coords[0]}`;
