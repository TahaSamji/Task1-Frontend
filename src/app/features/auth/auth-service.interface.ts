// src/app/features/auth/auth-service.interface.ts
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export interface AuthResponse {
  token: string;
}

export interface AuthService {
  login(email: string, password: string): Observable<AuthResponse>;
  signup(username: string, email: string, password: string): Observable<AuthResponse>;

  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;

  isLoggedIn(): boolean;

  getRole(): string | null;
  getUserId(): string | null;
  getUsername(): string | null;

  isAdmin(): boolean;
  isUser(): boolean;

  getAuthHeaders(): HttpHeaders;
}
