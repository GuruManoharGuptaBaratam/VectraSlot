import { AuthRequest, AuthResponse, IAuthStrategy } from "./strategies/auth.strategy.interface";

export class AuthService {
    private strategy: IAuthStrategy;

    constructor(strategy: IAuthStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: IAuthStrategy) {
        this.strategy = strategy;
    }

    async register(data: AuthRequest): Promise<AuthResponse> {
        return this.strategy.register(data);
    }

    async login(data: AuthRequest): Promise<AuthResponse> {
        return this.strategy.login(data);
    }
}
