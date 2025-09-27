import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { LucideAngularModule, Shield, Lock, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, Smartphone } from 'lucide-angular';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-security',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    CardModule,
    DividerModule,
    LucideAngularModule
  ],
  templateUrl: './security.html',
  styleUrl: './security.css',
  providers: [MessageService]
})
export class Security {
  // Iconos Lucide
  shieldIcon = Shield;
  lockIcon = Lock;
  keyIcon = Key;
  eyeIcon = Eye;
  eyeOffIcon = EyeOff;
  alertTriangleIcon = AlertTriangle;
  checkCircleIcon = CheckCircle;
  clockIcon = Clock;
  smartphoneIcon = Smartphone;

  // Formulario de cambio de contraseña
  passwordForm!: FormGroup;
  
  // Estados
  isLoading = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private accountService: AccountService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmitPasswordChange() {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);
      
      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
        confirmPassword: this.passwordForm.get('confirmPassword')?.value
      };

      this.accountService.changePassword(passwordData).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message || 'Contraseña actualizada correctamente'
            });
            
            this.passwordForm.reset();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al cambiar la contraseña'
            });
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          
          let errorMessage = 'Error al cambiar la contraseña';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Manejar errores de validación
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join(', ');
          } else if (error.status === 400) {
            errorMessage = 'La contraseña actual es incorrecta';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          } else if (error.status === 422) {
            errorMessage = 'Datos de entrada inválidos';
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          
          this.isLoading.set(false);
        }
      });
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword.set(!this.showCurrentPassword());
        break;
      case 'new':
        this.showNewPassword.set(!this.showNewPassword());
        break;
      case 'confirm':
        this.showConfirmPassword.set(!this.showConfirmPassword());
        break;
    }
  }

  get f() {
    return this.passwordForm.controls;
  }
}
