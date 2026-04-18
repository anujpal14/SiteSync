// src/app/core/models/auth.models.ts

export type UserRole = 'Admin' | 'Supervisor' | 'Labour';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token:    string;
  username: string;
  role:     UserRole;
  fullName: string;
  expires:  string;
}

export interface AuthUser {
  username: string;
  fullName: string;
  role:     UserRole;
  token:    string;
  expires:  string;
}

// What each role can access
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Admin:      ['dashboard','sites','clients','labour','finance','analytics','settings'],
  Supervisor: ['dashboard','sites','labour','analytics'],
  Labour:     ['dashboard','labour'],
};