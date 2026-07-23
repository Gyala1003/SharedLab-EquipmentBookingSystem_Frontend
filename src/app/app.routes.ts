import { Routes } from '@angular/router'
import { authGuard, guestGuard, adminGuard, labManagerGuard } from './core/auth/auth.guard'
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
      // Bookings (Requester)
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
      // Policies (User view)
      {
        path: 'policies',
        loadComponent: () =>
          import('./features/policies/user-policy-list.page').then((m) => m.UserPolicyListPage),
      },
      // Lab Manager routes
      {
        path: 'manager/approvals',
        canActivate: [labManagerGuard],
        loadComponent: () =>
          import('./features/bookings/booking-waiting-list.page').then(
            (m) => m.BookingWaitingListPage,
          ),
      },
      {
        path: 'manager/incidents',
        canActivate: [labManagerGuard],
        loadComponent: () =>
          import('./features/incidents/incident-list.page').then((m) => m.IncidentListPage),
      },
      {
        path: 'manager/violations',
        canActivate: [labManagerGuard],
        loadComponent: () =>
          import('./features/violations/violation-list.page').then((m) => m.ViolationListPage),
      },
      {
        path: 'manager/maintenance',
        canActivate: [labManagerGuard],
        loadComponent: () =>
          import('./features/maintenance/maintenance-list.page').then((m) => m.MaintenanceListPage),
      },
      // Admin routes
      {
        path: 'admin/policies',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/policies/policy-list.page').then((m) => m.PolicyListPage),
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
