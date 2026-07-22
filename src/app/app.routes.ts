import { Routes } from '@angular/router'
import { authGuard, guestGuard, adminGuard, managerGuard } from './core/auth/auth.guard'
import { AppLayoutComponent } from './shared/layout/app-layout'

export const routes: Routes = [
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      // Lab Rooms
      {
        path: 'lab-rooms',
        loadComponent: () =>
          import('./features/lab-rooms/lab-room-list.page').then((m) => m.LabRoomListPage),
      },
      {
        path: 'lab-rooms/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/lab-rooms/lab-room-form.page').then((m) => m.LabRoomFormPage),
      },
      {
        path: 'lab-rooms/:id',
        loadComponent: () =>
          import('./features/lab-rooms/lab-room-detail.page').then((m) => m.LabRoomDetailPage),
      },
      {
        path: 'lab-rooms/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/lab-rooms/lab-room-form.page').then((m) => m.LabRoomFormPage),
      },
      // Equipments
      {
        path: 'equipments',
        loadComponent: () =>
          import('./features/equipments/equipment-list.page').then((m) => m.EquipmentListPage),
      },
      {
        path: 'equipments/:id',
        loadComponent: () =>
          import('./features/equipments/equipment-detail.page').then((m) => m.EquipmentDetailPage),
      },
      // Bookings
      {
        path: 'bookings/history',
        loadComponent: () =>
          import('./features/bookings/booking-history.page').then((m) => m.BookingHistoryPage),
      },
      {
        path: 'bookings/:id',
        loadComponent: () =>
          import('./features/bookings/booking-detail.page').then((m) => m.BookingDetailPage),
      },
      {
        path: 'admin/bookings',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./features/bookings/booking-waiting-list.page').then(
            (m) => m.BookingWaitingListPage,
          ),
      },
      // Users (Admin only)
      {
        path: 'users',
        canActivate: [adminGuard],
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
