import { Injectable } from "@angular/core";
import { Observable ,throwError, delay, of } from "rxjs";
import type {LoginPayload, LoginResponse} from "./auth.types";

Injectable({providedIn: 'root'})
export class AuthService{

    login(payload: LoginPayload): Observable<LoginResponse>{

        if(payload.password !== 'password'){
        return throwError(() => new Error('InvalidCredentials')).pipe(delay(500))
        }

        return of<LoginResponse>({
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            user: {
                id: 1,
                name: 'Demo User',
                email: payload.email
            }
        }).pipe(delay(500));
    }
}