import { Component, effect, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { AnimalDto } from '../../models/DTOs/animal';
import { AnimalCreateDto } from '../../models/DTOs/animal-create';
import { AnimalUpdateDto } from '../../models/DTOs/animal-update';
import { CatalogOptions } from '../../models/interfaces/catalog-options.interface';
import { FincaDto } from '../../../farms/models/finca.dto';
import { FarmContextService } from '../../../../core/services/farm-context.service';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TabsModule
  ],
  templateUrl: './animal-form.component.html',
  styleUrl: './animal-form.component.css'
})
export class AnimalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fincaContextService = inject(FarmContextService);

  // Inputs
  readonly animal = input<AnimalDto | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly catalogOptions = input<CatalogOptions | null>(null);
  readonly selectedPadre = input<AnimalDto | null>(null);
  readonly selectedMadre = input<AnimalDto | null>(null);

  // Outputs
  readonly onSave = output<AnimalCreateDto | AnimalUpdateDto>();
  readonly onCancel = output<void>();
  readonly onSelectCriador = output<void>();
  readonly onSelectPropietario = output<void>();
  readonly onSelectPadre = output<void>();
  readonly onSelectMadre = output<void>();

  animalForm!: FormGroup;
  submitted = false;

  // Fincas seleccionadas (vendrán del componente padre)
  selectedCriadorFinca: FincaDto | null = null;
  selectedPropietarioFinca: FincaDto | null = null;

  private messageService = inject(MessageService);

  constructor() {
    this.initializeForm();

    // Effect para cargar datos cuando se edita
    effect(() => {
      const animalData = this.animal();
      if (animalData && this.isEditMode()) {
        this.loadAnimalData(animalData);
      }
    });

    // Effect para monitorear catálogos
    effect(() => {
      const catalogs = this.catalogOptions();
      console.log('📋 Catálogos actualizados:', catalogs);
      if (catalogs) {
        console.log('  - Colors:', catalogs.colors);
        console.log('  - Hair Types:', catalogs.hairTypes);
        console.log('  - Breeds:', catalogs.breeds);
      }
    });

    // Effect para actualizar padre seleccionado
    effect(() => {
      const padre = this.selectedPadre();
      if (padre) {
        this.animalForm.patchValue({
          cod_finca_padre: padre.cod_finca,
          cod_padre: padre.cod_animal,
          nombre_padre: padre.nomb_animal
        });
      }
    });

    // Effect para actualizar madre seleccionada
    effect(() => {
      const madre = this.selectedMadre();
      if (madre) {
        this.animalForm.patchValue({
          cod_finca_madre: madre.cod_finca,
          cod_madre: madre.cod_animal,
          nombre_madre: madre.nomb_animal
        });
      }
    });

    // Effect para sincronizar cod_finca_actual con cod_finca
    this.animalForm.get('cod_finca')?.valueChanges.subscribe(codFinca => {
      if (codFinca && !this.animalForm.get('cod_finca_actual')?.value) {
        this.animalForm.patchValue({ cod_finca_actual: codFinca });
      }
    });
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  /**
   * Inicializa el formulario con todas las validaciones
   */
  private initializeForm(): void {
    this.animalForm = this.fb.group({
      // === INFORMACIÓN BÁSICA ===
      cod_finca: [{ value: this.fincaContextService.getSelectedFarm(), disabled: true }, [Validators.required]],
      cod_animal: ['', [Validators.required, Validators.maxLength(15)]],
      nomb_animal: ['', [Validators.required, Validators.maxLength(50)]],
      sexo_animal: ['M', [Validators.required]],
      fec_nacim: ['', [Validators.required]],
      fec_ingreso: [''],
      estatus: ['A'],
      imagen: [''],

      // === CATÁLOGOS ===
      cod_raza: [null, [Validators.required]],
      cod_color: [null],
      cod_tipo_pelo: [null],
      origen: ['N', [Validators.required]],

      // === FINCAS ===
      cod_finca_actual: [this.fincaContextService.getSelectedFarm(), [Validators.required]],
      siglas_criador: [''],
      nombre_criador: [''],
      siglas_propietario: [''],
      nombre_propietario: [''],

      // === GENEALOGÍA ===
      cod_finca_padre: [null],
      cod_padre: [''],
      nombre_padre: [''],
      cri_padre: [''],
      nro_reg_padre: [''],
      cod_aso_padre: [''],
      padre_aso: [''],
      pru_aso_padre: [''],

      cod_finca_madre: [null],
      cod_madre: [''],
      nombre_madre: [''],
      cri_madre: [''],
      nro_reg_madre: [''],
      cod_aso_madre: [''],
      madre_aso: [''],
      pru_aso_madre: [''],

      // === PESOS Y MEDIDAS ===
      peso_actual: [0, [Validators.min(0)]],
      peso_al_nacer: [0, [Validators.min(0)]],
      peso_destete: [0, [Validators.min(0)]],
      fec_destete: [''],

      // === TATUAJES E IDENTIFICACIÓN ===
      tatuaje: [''],
      tatuaje_oreja_izq: [''],
      tatuaje_oreja_der: [''],
      tatuaje_cola: [''],

      // === REPRODUCCIÓN ===
      tipo_concepcion: ['M'],
      tipo_parto: ['S'],
      material_genetico: ['A'],
      protocolo_importacion: ['S'],

      // === COMPOSICIÓN RACIAL ===
      codigo_aso: [''],
      p_sangre: [''],
      porcen_sangre: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]],

      // === INFORMACIÓN ADICIONAL ===
      info_orejas: ['', [Validators.maxLength(200)]],
      info_cuernos: ['', [Validators.maxLength(200)]],
      tipo_registro: ['', [Validators.maxLength(200)]],
      aretes: ['', [Validators.maxLength(200)]],
      reg_intl: ['', [Validators.maxLength(200)]],
      observac: [''],

      // === OTROS ===
      precio_con_igv: [0, [Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]]
    });
  }

  /**
   * Carga los datos del animal en el formulario para edición
   */
  private loadAnimalData(animal: AnimalDto): void {
    this.animalForm.patchValue({
      cod_finca: animal.cod_finca,
      cod_animal: animal.cod_animal,
      nomb_animal: animal.nomb_animal,
      sexo_animal: animal.sexo_animal,
      fec_nacim: this.formatDateForInput(animal.fec_nacim),
      fec_ingreso: this.formatDateForInput(animal.fec_ingreso),
      estatus: animal.estatus,
      imagen: animal.imagen,
      cod_raza: animal.cod_raza,
      cod_color: animal.cod_color,
      cod_tipo_pelo: animal.cod_tipo_pelo,
      origen: animal.origen,
      cod_finca_actual: animal.cod_finca_actual,
      cod_finca_padre: animal.cod_finca_padre,
      cod_padre: animal.cod_padre,
      cod_finca_madre: animal.cod_finca_madre,
      cod_madre: animal.cod_madre,
      peso_actual: animal.peso_actual,
      peso_al_nacer: animal.peso_al_nacer,
      tatuaje: animal.tatuaje,
      tatuaje_oreja_izq: animal.tatuaje_oreja_izq,
      tatuaje_oreja_der: animal.tatuaje_oreja_der,
      tatuaje_cola: animal.tatuaje_cola,
      tipo_concepcion: animal.tipo_concepcion,
      tipo_parto: animal.tipo_parto,
      material_genetico: animal.material_genetico,
      codigo_aso: animal.codigo_aso,
      p_sangre: animal.p_sangre,
      porcen_sangre: animal.porcen_sangre,
      info_orejas: animal.info_orejas,
      info_cuernos: animal.info_cuernos,
      tipo_registro: animal.tipo_registro,
      aretes: animal.aretes,
      reg_intl: animal.reg_intl,
      observac: animal.observac
    });

    // Deshabilitar campos que no se pueden editar
    this.animalForm.get('cod_finca')?.disable();
    this.animalForm.get('cod_animal')?.disable();
  }

  /**
   * Formatea una fecha para el input date
   */
  private formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    // Si ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Intentar parsear y formatear
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    return '';
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.animalForm.invalid) {
      console.error('Formulario inválido. Errores:');
      const invalidFields: string[] = [];
      Object.keys(this.animalForm.controls).forEach(key => {
        const control = this.animalForm.get(key);
        if (control?.invalid) {
          console.error(`- ${key}:`, control.errors);
          invalidFields.push(key);
        }
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario incompleto',
        detail: `Por favor complete los campos requeridos. Campos faltantes: ${invalidFields.length}`,
        life: 5000
      });
      
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.animalForm.getRawValue();
    console.log('Valores del formulario:', formValue);
    
    if (this.isEditMode()) {
      const updateDto: AnimalUpdateDto = this.buildUpdateDto(formValue);
      console.log('DTO de actualización:', updateDto);
      this.onSave.emit(updateDto);
    } else {
      const createDto: AnimalCreateDto = this.buildCreateDto(formValue);
      console.log('DTO de creación:', createDto);
      this.onSave.emit(createDto);
    }
  }

  /**
   * Convierte un objeto Date a string YYYY-MM-DD
   */
  private formatDateToString(date: Date | string | null | undefined): string | undefined {
    if (!date) return undefined;
    
    // Si ya es string, retornarlo
    if (typeof date === 'string') return date;
    
    // Si es Date, convertir a YYYY-MM-DD
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return undefined;
  }

  /**
   * Construye el DTO para crear un animal
   */
  private buildCreateDto(formValue: any): AnimalCreateDto {
    const dto: any = {
      cod_finca: formValue.cod_finca,
      cod_animal: formValue.cod_animal,
      nomb_animal: formValue.nomb_animal,
      sexo_animal: formValue.sexo_animal,
      cod_raza: formValue.cod_raza,
      cod_color: formValue.cod_color || 1, // Valor por defecto si está vacío
      cod_tipo_pelo: formValue.cod_tipo_pelo || 1, // Valor por defecto si está vacío
      fec_nacim: this.formatDateToString(formValue.fec_nacim),
      estatus: formValue.estatus,
      origen: formValue.origen
    };

    // Agregar campos opcionales solo si tienen valor
    if (formValue.fec_ingreso) dto.fec_ingreso = this.formatDateToString(formValue.fec_ingreso);
    if (formValue.cod_finca_actual) dto.cod_finca_actual = formValue.cod_finca_actual;
    if (formValue.cod_finca_padre) dto.cod_finca_padre = formValue.cod_finca_padre;
    if (formValue.cod_padre) dto.cod_padre = formValue.cod_padre;
    if (formValue.cod_finca_madre) dto.cod_finca_madre = formValue.cod_finca_madre;
    if (formValue.cod_madre) dto.cod_madre = formValue.cod_madre;
    if (formValue.peso_actual) dto.peso_actual = formValue.peso_actual;
    if (formValue.peso_al_nacer) dto.peso_al_nacer = formValue.peso_al_nacer;
    if (formValue.peso_destete) dto.peso_destete = formValue.peso_destete;
    if (formValue.fec_destete) dto.fec_destete = this.formatDateToString(formValue.fec_destete);
    if (formValue.tatuaje) dto.tatuaje = formValue.tatuaje;
    if (formValue.codigo_aso) dto.cod_asociacion = formValue.codigo_aso;
    if (formValue.porcen_sangre) dto.porcen_sangre = formValue.porcen_sangre;
    if (formValue.observac) dto.observac = formValue.observac;

    return dto as AnimalCreateDto;
  }

  /**
   * Construye el DTO para actualizar un animal
   */
  private buildUpdateDto(formValue: any): AnimalUpdateDto {
    const createDto = this.buildCreateDto(formValue);
    const { cod_finca, cod_animal, ...updateData } = createDto;
    return updateData as AnimalUpdateDto;
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.animalForm.controls).forEach(key => {
      const control = this.animalForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Cancela la edición/creación
   */
  cancel(): void {
    this.onCancel.emit();
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const field = this.animalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.animalForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;

    return 'Campo inválido';
  }

  /**
   * Abre el diálogo de selección de finca criadora
   */
  selectCriador(): void {
    this.onSelectCriador.emit();
  }

  /**
   * Abre el diálogo de selección de finca propietaria
   */
  selectPropietario(): void {
    this.onSelectPropietario.emit();
  }

  /**
   * Abre el diálogo de selección de padre
   */
  selectPadre(): void {
    this.onSelectPadre.emit();
  }

  /**
   * Abre el diálogo de selección de madre
   */
  selectMadre(): void {
    this.onSelectMadre.emit();
  }
}
