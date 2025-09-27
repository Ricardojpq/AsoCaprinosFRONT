import { Component } from '@angular/core';
import { LucideAngularModule, User, Mail, Building, MapPin } from 'lucide-angular';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-account-general',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './account-general.html',
  styleUrl: './account-general.css'
})
export class AccountGeneral {
  // Iconos Lucide
  userIcon = User;
  mailIcon = Mail;
  buildingIcon = Building;
  mapPinIcon = MapPin;

  constructor(
    public authService: AuthService
  ) {}

  // Getter para acceder al usuario de forma reactiva
  get currentUser() {
    return this.authService.user();
  }
}
