import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AccountGeneral } from './components/account-general/account-general';
import { Security } from './components/security/security';
import { LucideAngularModule, User, Shield } from 'lucide-angular';

@Component({
  selector: 'app-account',
  imports: [
    TabsModule,
    AccountGeneral,
    Security,
    LucideAngularModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account {
  // Iconos Lucide
  userIcon = User;
  shieldIcon = Shield;
}
