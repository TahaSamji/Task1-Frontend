// features/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string; // 'Admin', 'User', 'Encoder', etc.
  exp: number;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5206/api/auth';

  private readonly tokenKey = 'token';
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  signup(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { username, email, password });
  }
   // Save token (e.g. after login)
  setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);

    console.log("User role:", this.getRole());
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
   
  }

  removeToken(): void {
    sessionStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 > Date.now();
  }

  getRole(): string | null {
    const token = this.getToken();

    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    console.log(decoded);
    return decoded.role;
  }

  getUserId(): string | null {
    const token = this.getToken();

    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    console.log(decoded);
    return decoded.sub;
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.username;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }


  isUser(): boolean {
    return this.getRole() === 'User';
  }
}
