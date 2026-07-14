import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './shared/layout/public-layout/public-layout.component';
import { HomeComponent } from './feature/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children:[
            {
                path:'',
                component: HomeComponent
            }
        ]
    }
];
