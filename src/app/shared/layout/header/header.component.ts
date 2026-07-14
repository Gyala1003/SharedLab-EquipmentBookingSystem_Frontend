import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';
import { LogoComponent } from "../../ui/logo/logo.component";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
    RouterLink,
    ButtonComponent,
    LogoComponent
],
    templateUrl: './header.component.html'
})
export class HeaderComponent {}