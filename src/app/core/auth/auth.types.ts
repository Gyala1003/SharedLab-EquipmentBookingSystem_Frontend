export interface AuthUser {
    id : number
    name : string
    email : string
}

export interface LoginPayload {
    email : string
    password : string
}

export interface LoginResponse {
    accessToken : string
    refreshToken? : string
    user : AuthUser
}