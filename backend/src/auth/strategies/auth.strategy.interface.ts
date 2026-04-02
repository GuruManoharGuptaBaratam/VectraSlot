export type Role = 'ADMIN' | 'USER';

export interface AuthRequest {
    name?: string;
    email: string;
    password: string;
    role?: Role;
    adminSecret?: string; // Add back for secure Admin login
}

export interface AuthResponse {
    user: {
        id: number;
        name: string;
        email: string;
        role: Role;
    };
    token: string;
}

export interface IAuthStrategy {
    register(data: AuthRequest): Promise<AuthResponse>;
    login(data: AuthRequest): Promise<AuthResponse>;
}
