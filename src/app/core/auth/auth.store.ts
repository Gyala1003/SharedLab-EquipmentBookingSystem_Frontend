import { computed, inject, Injectable, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AuthService } from "./auth.service";
import { TokenStorage } from "./token-storage";
import type { AuthUser, LoginPayload } from "./auth.types";

@Injectable({ providedIn: "root" })
export class AuthStore {
    private readonly auth = inject(AuthService)
    private readonly tokens = inject(TokenStorage)

    private readonly _user = signal<AuthUser | null>(this.restore())
    private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
    private readonly _error = signal<string | null>(null)

    readonly user = this._user.asReadonly()
    readonly status = this._status.asReadonly()
    readonly error = this._error.asReadonly()
    readonly isAuhthenticated = computed(() => this._user() !== null)

    async login(payload: LoginPayload): Promise<void> {
        this._status.set('loading')
        this._error.set(null)
        try {
            const response = await firstValueFrom(this.auth.login(payload))
            this.tokens.set(response.accessToken, response.refreshToken)
            this._user.set(response.user)
            localStorage.setItem('User_key', JSON.stringify(response.user))
            this._status.set('idle')
        } catch (e) {
            this._status.set('error')
            this._error.set((e instanceof Error) ? e.message : 'error')
            throw e
        }
    }

    logout(): void {
        this.tokens.clear()
        localStorage.removeItem('User_key')
        this._user.set(null)
        this._status.set('idle')
        this._error.set(null)
    }

    private restore(): AuthUser | null {
        const user = localStorage.getItem('User_key')
        return user ? (JSON.parse(user) as AuthUser) : null
    }
}