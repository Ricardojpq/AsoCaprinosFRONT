import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, Usuario, Perfil, FincaDisponible, CreateUserRequest, UpdateUserRequest } from '@core/services/user-management.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { LucideAngularModule, UserPlus, Search, FilterX, Eye, Pencil, KeyRound, Ban, CheckCircle, Users, Copy, Check, AlertTriangle, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    PasswordModule,
    LucideAngularModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  // Iconos de Lucide
  readonly userPlusIcon = UserPlus;
  readonly searchIcon = Search;
  readonly filterXIcon = FilterX;
  readonly eyeIcon = Eye;
  readonly pencilIcon = Pencil;
  readonly keyIcon = KeyRound;
  readonly banIcon = Ban;
  readonly checkCircleIcon = CheckCircle;
  readonly usersIcon = Users;
  readonly copyIcon = Copy;
  readonly checkIcon = Check;
  readonly alertIcon = AlertTriangle;
  readonly mapPinIcon = MapPin;

  // Signals para estado reactivo
  usuarios = signal<Usuario[]>([]);
  perfiles = signal<Perfil[]>([]);
  fincasDisponibles = signal<FincaDisponible[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  perPage = 10;

  // Filtros
  searchTerm = signal('');
  filterPerfil = signal<number | null>(null);
  filterActive = signal<boolean | null>(null);

  // Opciones para selects
  estadoOptions = [
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ];

  perfilesOptions = computed(() => 
    this.perfiles().map(p => ({ label: p.descripcion, value: p.id_perfil }))
  );

  // Perfiles sin SuperAdmin para crear usuarios
  perfilesParaCrearOptions = computed(() => 
    this.perfiles()
      .filter(p => p.id_perfil !== 1) // Excluir SuperAdmin (id=1)
      .map(p => ({ label: p.descripcion, value: p.id_perfil }))
  );

  // Modal
  showModal = signal(false);
  showModalVisible = false; // Para p-dialog two-way binding
  modalMode = signal<'create' | 'edit' | 'view'>('create');
  selectedUser = signal<Usuario | null>(null);

  // Opciones para finca principal (computed basado en fincas seleccionadas)
  fincasPrincipalesOptions = computed(() => {
    const selectedFincas = this.userForm?.get('fincas')?.value || [];
    return this.fincasDisponibles()
      .filter(f => selectedFincas.includes(f.cod_finca))
      .map(f => ({ label: f.nomb_finca, value: f.cod_finca }));
  });
  
  // Formulario
  userForm: FormGroup;
  formLoading = signal(false);
  formError = signal<string | null>(null);
  formErrors = signal<{ [key: string]: string[] }>({});

  // Modal de confirmación
  showConfirmModal = signal(false);
  showConfirmModalVisible = false;
  confirmAction = signal<'delete' | 'reactivate' | 'reset-password' | null>(null);
  confirmUser = signal<Usuario | null>(null);

  // Modal de contraseña temporal
  showTempPasswordModal = signal(false);
  showTempPasswordModalVisible = false;
  tempPassword = signal<string | null>(null);

  // Modal de asignación de fincas
  showFincasModalVisible = false;
  selectedFincasTemp: FincaDisponible[] = [];

  constructor(
    private userService: UserManagementService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nombre_usuario: ['', [Validators.required, Validators.maxLength(100)]],
      apellido_usuario: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.minLength(8)]],
      id_perfil_usuario: [null, Validators.required],
      fincas: [[]],
      finca_principal: [null],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadPerfiles();
    this.loadFincas();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const params: any = {
        page: this.currentPage(),
        per_page: this.perPage,
      };
      
      if (this.searchTerm()) {
        params.search = this.searchTerm();
      }
      if (this.filterPerfil() !== null) {
        params.perfil_id = this.filterPerfil();
      }
      if (this.filterActive() !== null) {
        params.is_active = this.filterActive();
      }
      
      const response = await this.userService.getUsers(params).toPromise();

      if (response) {
        this.usuarios.set(response.data);
        this.totalPages.set(response.last_page);
        this.totalItems.set(response.total);
      }
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al cargar usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  async loadPerfiles(): Promise<void> {
    try {
      const perfiles = await this.userService.getPerfiles().toPromise();
      if (perfiles) {
        this.perfiles.set(perfiles);
      }
    } catch (err) {
      console.error('Error al cargar perfiles', err);
    }
  }

  async loadFincas(): Promise<void> {
    try {
      const fincas = await this.userService.getFincasDisponibles().toPromise();
      if (fincas) {
        this.fincasDisponibles.set(fincas);
      }
    } catch (err) {
      console.error('Error al cargar fincas', err);
    }
  }

  // Búsqueda y filtros
  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterPerfil.set(null);
    this.filterActive.set(null);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  // Modal de usuario
  openCreateModal(): void {
    this.modalMode.set('create');
    this.selectedUser.set(null);
    this.userForm.reset({ is_active: true, fincas: [] });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.formError.set(null);
    this.formErrors.set({});
    this.showModal.set(true);
    this.showModalVisible = true;
  }

  openEditModal(user: Usuario): void {
    this.modalMode.set('edit');
    this.selectedUser.set(user);
    this.userForm.patchValue({
      nombre_usuario: user.nombre_usuario,
      apellido_usuario: user.apellido_usuario,
      email: user.email,
      id_perfil_usuario: user.id_perfil_usuario,
      fincas: user.fincas?.map(f => f.cod_finca) || [],
      finca_principal: user.fincas?.find(f => f.pivot?.es_finca_principal)?.cod_finca || null,
      is_active: user.is_active
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.formError.set(null);
    this.formErrors.set({});
    this.showModal.set(true);
    this.showModalVisible = true;
  }

  openViewModal(user: Usuario): void {
    this.modalMode.set('view');
    this.selectedUser.set(user);
    this.showModal.set(true);
    this.showModalVisible = true;
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showModalVisible = false;
    this.selectedUser.set(null);
    this.formError.set(null);
  }

  async saveUser(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.formError.set(null);
    this.formErrors.set({});

    try {
      const formData = this.userForm.value;

      if (this.modalMode() === 'create') {
        const createData: CreateUserRequest = {
          nombre_usuario: formData.nombre_usuario,
          apellido_usuario: formData.apellido_usuario,
          email: formData.email,
          password: formData.password,
          id_perfil_usuario: formData.id_perfil_usuario,
          fincas: formData.fincas,
          finca_principal: formData.finca_principal
        };
        await this.userService.createUser(createData).toPromise();
      } else {
        const updateData: UpdateUserRequest = {
          nombre_usuario: formData.nombre_usuario,
          apellido_usuario: formData.apellido_usuario,
          email: formData.email,
          id_perfil_usuario: formData.id_perfil_usuario,
          is_active: formData.is_active,
          fincas: formData.fincas,
          finca_principal: formData.finca_principal
        };
        await this.userService.updateUser(this.selectedUser()!.id_usuario, updateData).toPromise();
      }

      this.closeModal();
      this.loadUsers();
    } catch (err: any) {
      // Capturar errores de validación del backend
      if (err.error?.errors) {
        this.formErrors.set(err.error.errors);
        // Mostrar mensaje general
        const errorMessages = Object.values(err.error.errors).flat().join('. ');
        this.formError.set(errorMessages);
      } else {
        this.formError.set(err.error?.message || 'Error al guardar usuario');
      }
    } finally {
      this.formLoading.set(false);
    }
  }

  // Acciones de confirmación
  confirmDelete(user: Usuario): void {
    this.confirmUser.set(user);
    this.confirmAction.set('delete');
    this.showConfirmModal.set(true);
    this.showConfirmModalVisible = true;
  }

  confirmReactivate(user: Usuario): void {
    this.confirmUser.set(user);
    this.confirmAction.set('reactivate');
    this.showConfirmModal.set(true);
    this.showConfirmModalVisible = true;
  }

  confirmResetPassword(user: Usuario): void {
    this.confirmUser.set(user);
    this.confirmAction.set('reset-password');
    this.showConfirmModal.set(true);
    this.showConfirmModalVisible = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.showConfirmModalVisible = false;
    this.confirmUser.set(null);
    this.confirmAction.set(null);
  }

  async executeConfirmAction(): Promise<void> {
    const user = this.confirmUser();
    const action = this.confirmAction();

    if (!user || !action) return;

    this.formLoading.set(true);

    try {
      switch (action) {
        case 'delete':
          await this.userService.deleteUser(user.id_usuario).toPromise();
          break;
        case 'reactivate':
          await this.userService.reactivateUser(user.id_usuario).toPromise();
          break;
        case 'reset-password':
          const result = await this.userService.resetPassword(user.id_usuario).toPromise();
          if (result) {
            this.tempPassword.set(result.temp_password);
            this.showTempPasswordModal.set(true);
            this.showTempPasswordModalVisible = true;
          }
          break;
      }

      this.closeConfirmModal();
      this.loadUsers();
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al ejecutar acción');
    } finally {
      this.formLoading.set(false);
    }
  }

  closeTempPasswordModal(): void {
    this.showTempPasswordModal.set(false);
    this.showTempPasswordModalVisible = false;
    this.tempPassword.set(null);
  }

  copyTempPassword(): void {
    const password = this.tempPassword();
    if (password) {
      navigator.clipboard.writeText(password);
    }
  }

  // Helpers
  getPerfilName(perfilId: number): string {
    const perfil = this.perfiles().find(p => p.id_perfil === perfilId);
    return perfil?.descripcion || 'Sin perfil';
  }

  getFincasNames(user: Usuario): string {
    if (!user.fincas || user.fincas.length === 0) {
      return 'Sin fincas asignadas';
    }
    return user.fincas.map(f => f.nomb_finca).join(', ');
  }

  getFincaName(codFinca: number): string {
    const finca = this.fincasDisponibles().find(f => f.cod_finca === codFinca);
    return finca?.nomb_finca || 'Finca desconocida';
  }

  getPerfilSeverity(perfilId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (perfilId) {
      case 1: return 'warn'; // SuperAdmin
      case 2: return 'info'; // Admin Finca
      case 3: return 'secondary'; // Usuario Básico
      default: return 'secondary';
    }
  }

  onLazyLoad(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.currentPage.set(page);
    this.loadUsers();
  }

  toggleFinca(codFinca: number): void {
    const currentFincas = this.userForm.get('fincas')?.value || [];
    const index = currentFincas.indexOf(codFinca);
    
    if (index === -1) {
      currentFincas.push(codFinca);
    } else {
      currentFincas.splice(index, 1);
      // Si era la finca principal, limpiarla
      if (this.userForm.get('finca_principal')?.value === codFinca) {
        this.userForm.patchValue({ finca_principal: null });
      }
    }
    
    this.userForm.patchValue({ fincas: [...currentFincas] });
  }

  isFincaSelected(codFinca: number): boolean {
    const fincas = this.userForm.get('fincas')?.value || [];
    return fincas.includes(codFinca);
  }

  // Modal de fincas
  openFincasModal(): void {
    // Preseleccionar las fincas ya asignadas
    const currentFincas = this.userForm.get('fincas')?.value || [];
    this.selectedFincasTemp = this.fincasDisponibles().filter(f => currentFincas.includes(f.cod_finca));
    this.showFincasModalVisible = true;
  }

  closeFincasModal(): void {
    this.showFincasModalVisible = false;
    this.selectedFincasTemp = [];
  }

  confirmFincasSelection(): void {
    const selectedCodes = this.selectedFincasTemp.map(f => f.cod_finca);
    this.userForm.patchValue({ fincas: selectedCodes });
    
    // Si la finca principal ya no está en la selección, limpiarla
    const currentPrincipal = this.userForm.get('finca_principal')?.value;
    if (currentPrincipal && !selectedCodes.includes(currentPrincipal)) {
      this.userForm.patchValue({ finca_principal: null });
    }
    
    // Si solo hay una finca, establecerla como principal automáticamente
    if (selectedCodes.length === 1) {
      this.userForm.patchValue({ finca_principal: selectedCodes[0] });
    }
    
    this.closeFincasModal();
  }
}
