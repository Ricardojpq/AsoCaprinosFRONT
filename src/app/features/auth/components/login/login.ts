import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AutoFocusModule } from 'primeng/autofocus';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '@core/services/loading.service';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule, 
    CheckboxModule, 
    InputTextModule, 
    PasswordModule, 
    ReactiveFormsModule, 
    RouterModule, 
    RippleModule, 
    MessageModule,
    AutoFocusModule,
    ProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
    loginForm: FormGroup;

    constructor(
        private authService: AuthService,
        private loadingService: LoadingService,
        private fb: FormBuilder
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit() {
        // Datos de prueba para desarrollo
        this.loginForm.patchValue({
          email: 'admin@asocabra.com',
          password: 'password123'
        });
    }

    get error() {
        return this.authService.error;
    }

    get loading() {
        return this.loadingService.loading;
    }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    get rememberMe() {
        return this.loginForm.get('rememberMe');
    }

    onSubmit() {
        console.log('📝 Login: Enviando formulario con OAuth2...', this.loginForm.value);
        if (this.loginForm.valid) {
            const { email, password } = this.loginForm.value;
            console.log('✅ Login: Formulario válido, iniciando login con OAuth2...');
            console.log('🔄 Login: Llamando a authService.login...');
            this.authService.login(email, password);
            console.log('📤 Login: authService.login llamado, esperando respuesta...');
        } else {
            console.log('❌ Login: Formulario inválido, marcando campos...');
            this.markFormGroupTouched();
        }
    }

    onInputChange() {
        console.log('⌨️ Login: Input cambiado, limpiando errores...');
        // Limpiar error cuando el usuario empiece a escribir
        if (this.error()) {
            // El error se limpiará automáticamente en el AuthService
        }
    }

    private markFormGroupTouched() {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }
}
