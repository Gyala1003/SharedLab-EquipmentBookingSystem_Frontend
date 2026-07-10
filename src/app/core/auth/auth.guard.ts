import { inject } from "@angular/core"
import { CanActivateFn, Router } from "@angular/router"
import { AuthStore } from "./auth.store"

export const authGuard: CanActivateFn = (_route, state) => {
    const store = inject(AuthStore)
    const router = inject(Router)

    if(store.isAuhthenticated()){
        return true
    }

    return router.createUrlTree(['/login'], {
        queryParams: { redirect: state.url },
    })
}

export const guestGuard: CanActivateFn = () => {
    const store = inject(AuthStore)
    const router = inject(Router)
    return store.isAuhthenticated() ? router.createUrlTree(['/']) : true
}