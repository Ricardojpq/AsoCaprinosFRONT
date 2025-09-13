import { User } from "./user";

export interface Auth {
  status: string;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_expires_in: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_expires_in: number;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  status: string;
  message: string;
}