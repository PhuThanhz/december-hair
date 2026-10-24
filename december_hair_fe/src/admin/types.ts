// The admin API's shapes (december_hair_be/app/schemas/auth.py and admin.py)

export type Role = "admin" | "editor" | "branch_manager";
export type UiLang = "en" | "cs";
export const ROLES: Role[] = ["admin", "editor", "branch_manager"];

export interface UserBranch {
  id: number;
  slug: string;
  mall: string;
}

export interface Me {
  id: number;
  email: string;
  name: string;
  role: Role;
  uiLang: UiLang;
  lastLoginAt: string | null;
  branches: UserBranch[];
}

export interface AdminUser extends Me {
  isActive: boolean;
  createdAt: string;
}

export interface BranchOption {
  id: number;
  slug: string;
  mall: string;
  cityCs: string;
  cityEn: string;
  isPublished: boolean;
}

export interface Dashboard {
  branches: number;
  services: number;
  looks: number;
  reels: number;
  users: number | null;
  newBookings: number;
  newVoucherOrders: number;
}
