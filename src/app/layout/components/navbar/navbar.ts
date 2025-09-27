import { Component, EventEmitter, Output, inject } from '@angular/core';
import { LucideAngularModule, Menu, User, Settings, LogOut, Home, Award, PawPrint,ScrollText  } from 'lucide-angular';
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '@layout/services/layout-service';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, StyleClassModule, LucideAngularModule, ThemeToggle,AvatarModule,ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  readonly menuIcon = Menu;
  readonly homeIcon = Home;
  readonly userIcon = User;
  readonly awardIcon = Award;
  readonly pawPrintIcon = PawPrint;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;
  readonly scrollTextIcon = ScrollText;
  

  constructor(public layoutService: LayoutService, private authService: AuthService) { }

  onLogout() {
    this.authService.logout();
  }

  get currentUser() {
    return this.authService.user();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

 
  menuItems:any = [
    { name: 'Dashboard', path: 'Dashboard', icon: this.homeIcon },
    { name: 'Certificados', path: 'Certificates', icon: this.awardIcon },
    { name: 'Animales', path: 'Animals', icon: this.pawPrintIcon },
    { name: 'Socios', path: 'Members', icon: this.userIcon },
  ];
}
