import { User } from "./user";

export interface Auth {
  status: string;
  message: string;
  data: {
    user: User;
    expires_in: number;
    refresh_expires_in: number;
  };
} 