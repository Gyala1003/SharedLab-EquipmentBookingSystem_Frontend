import { Routes } from '@angular/router'
import { authGuard, guestGuard } from './core/auth/auth.guard'
import { AppLayoutComponent } from './shared/layout/app-layout'
import { PublicLayoutComponent } from './shared/layout/public-layout/public-layout.component'

export const routes: Routes = [
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        // Lazy-loaded feature chunk.
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/users-list.page').then((m) => m.UsersListPage),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
]
