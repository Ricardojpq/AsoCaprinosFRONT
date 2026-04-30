import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable, firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { CanComponentDeactivate } from '@core/guards/can-deactivate-animal-form.guard';
import { AnimalsState } from './state/animals.state';
import { FincaDto } from '@features/farms/models/finca.dto';
import { CatalogsService } from './catalogs/services/catalogs-service';
import { AnimalFormComponent } from './components/animal-form/animal-form.component';
import { AnimalListComponent } from './components/animal-list/animal-list.component';
import { AnimalSearchComponent } from './components/animal-search/animal-search.component';
import { AnimalSelectionTable } from './components/animal-selection-table/animal-selection-table';
import { AnimalToolbarComponent } from './components/animal-toolbar/animal-toolbar.component';
import { FarmsTableComponent } from './components/farms-table/farms-table.component';
import { AnimalDto, AnimalCreateDto, AnimalUpdateDto } from './models';
import { CatalogOptions } from './models/interfaces';
import { AnimalsService } from './services/animals-service';


@Component({
  selector: 'app-animals',
  templateUrl: './animals.html',
  styleUrl: './animals.css',
  providers: [AnimalsState, MessageService, ConfirmationService],
  imports: [
       CommonModule,
       ToastModule,
       ConfirmDialogModule,
       ToolbarModule,
       DialogModule,
       AnimalToolbarComponent,
       AnimalSearchComponent,
       AnimalListComponent,
       AnimalFormComponent,
       FarmsTableComponent,
       AnimalSelectionTable
],
})
export class Animals implements OnInit, OnDestroy, CanComponentDeactivate {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Inyección de dependencias
  readonly state = inject(AnimalsState);
  private animalsService = inject(AnimalsService);
  private catalogsService = inject(CatalogsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // ViewChild para acceder al formulario
  @ViewChild(AnimalFormComponent) animalFormComponent?: AnimalFormComponent;

  // Estados de diálogos de selección
  showFincaCriadorDialog = false;
  showFincaPropietarioDialog = false;
  showPadreDialog = false;
  showMadreDialog = false;

  // Fincas y animales seleccionados
  selectedFincaCriador: FincaDto | null = null;
  selectedFincaPropietario: FincaDto | null = null;
  selectedPadre: AnimalDto | null = null;
  selectedMadre: AnimalDto | null = null;

  get dialogVisible(): boolean {
    return this.state.dialogVisible();
  }
  set dialogVisible(value: boolean) {
    if (!value) {
      this.state.closeDialog();
    }
  }

  ngOnInit(): void {
    this.setupSearchPipe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura el pipe de búsqueda con debounce
   */
  private setupSearchPipe(): void {
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.state.setGlobalFilter(searchTerm);
        this.state.setCurrentPage(1);
        this.loadAnimals();
      });
  }

  /**
   * Carga los catálogos desde el servicio
   */
  private loadCatalogs(): void {
    this.state.setCatalogsLoading(true);

    const razas$ = this.catalogsService.getAllBreeds$();
    const colores$ = this.catalogsService.getAllColors$();
    const tiposPelo$ = this.catalogsService.getAllHairTypes$();

    // Cargar todos los catálogos en paralelo
    Promise.all([
      firstValueFrom(razas$),
      firstValueFrom(colores$),
      firstValueFrom(tiposPelo$)
    ]).then(([razas, colores, tiposPelo]) => {
      const catalogOptions: CatalogOptions = {
        sex: [
          { label: 'Macho', value: 'M' },
          { label: 'Hembra', value: 'H' }
        ],
        status: [
          { label: 'Activo', value: 'A' },
          { label: 'Inactivo', value: 'I' }
        ],
        origin: [
          { label: 'Nacido', value: 'N' },
          { label: 'Importado', value: 'I' },
          { label: 'Comprado', value: 'C' }
        ],
        conceptionType: [
          { label: 'Monta Natural', value: 'M' },
          { label: 'Inseminación', value: 'I' },
          { label: 'TE Fresco', value: 'F' },
          { label: 'TE Congelado', value: 'C' }
        ],
        birthType: [
          { label: 'Simple', value: 'S' },
          { label: 'Múltiple', value: 'M' },
          { label: 'Triple', value: 'T' }
        ],
        geneticMaterial: [
          { label: 'Nacional', value: 'A' },
          { label: 'Importado', value: 'I' }
        ],
        importProtocol: [
          { label: 'Sí', value: 'S' },
          { label: 'No', value: 'N' }
        ],
        bloodlinePurity: [
          { label: 'Puro', value: 'P' },
          { label: 'Mestizo', value: 'M' }
        ],
        breeds: razas?.map((r: any) => ({ 
          label: r.descripcion || r.nomb_raza, 
          value: r.cod_raza 
        })) || [],
        colors: colores?.map((c: any) => ({ 
          label: c.nomb_color || c.descripcion, 
          value: c.cod_color 
        })) || [],
        hairTypes: tiposPelo?.map((t: any) => ({ 
          label: t.nomb_tipo_pelo || t.descripcion, 
          value: t.cod_tipo_pelo 
        })) || [],
        earInfo: [],
        hornInfo: [],
        registryType: []
      };

      this.state.setCatalogOptions(catalogOptions);
      this.state.setCatalogsLoading(false);
    }).catch(error => {
      console.error('Error loading catalogs:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los catálogos'
      });
      this.state.setCatalogsLoading(false);
    });
  }

  /**
   * Carga los animales desde el servicio
   */
  private loadAnimals(): void {
    this.state.setLoading(true);

    const filters = this.state.filters();
    const params = {
      page: this.state.currentPage(),
      per_page: this.state.perPage(),
      sort_by: this.state.sortField(),
      sort_dir: this.state.sortOrder(),
      search: this.state.globalFilter(),
      ...filters,
      cod_finca: filters.cod_finca?.toString()
    };

    this.animalsService.getAnimals$(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.state.setAnimals(response.data || []);
          this.state.setTotalRecords(response.total || 0);
          this.state.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading animals:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los animales'
          });
          this.state.setLoading(false);
        }
      });
  }

  /**
   * Maneja el evento de carga lazy de la tabla
   */
  onTableLazyLoad(event: LazyLoadEvent): void {
    const page = event.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1;
    const perPage = event.rows || 10;
    const sortField = event.sortField || 'nomb_animal';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.state.setCurrentPage(page);
    this.state.setPerPage(perPage);
    this.state.setSortField(sortField);
    this.state.setSortOrder(sortOrder);

    this.loadAnimals();
  }

  /**
   * Maneja el cambio en la búsqueda
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
  }

  /**
   * Limpia la búsqueda
   */
  onClearSearch(): void {
    this.state.setGlobalFilter('');
    this.state.setCurrentPage(1);
    this.loadAnimals();
  }

  /**
   * Abre el diálogo para crear un nuevo animal
   */
  onNewAnimal(): void {
    // Cargar catálogos si no están cargados
    if (!this.state.catalogOptions()) {
      this.loadCatalogs();
    }
    this.state.openNewDialog();
  }

  /**
   * Abre el diálogo para editar un animal
   */
  onEditAnimal(animal: AnimalDto): void {
    // Cargar catálogos si no están cargados
    if (!this.state.catalogOptions()) {
      this.loadCatalogs();
    }
    this.state.openEditDialog(animal);
  }

  /**
   * Elimina un animal con confirmación
   */
  onDeleteAnimal(animal: AnimalDto): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el animal ${animal.nomb_animal}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteAnimal(animal);
      }
    });
  }

  /**
   * Ejecuta la eliminación del animal
   */
  private deleteAnimal(animal: AnimalDto): void {
    this.animalsService
      .deleteAnimal$(animal.cod_finca.toString(), animal.cod_animal)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.state.removeAnimal(animal.cod_finca, animal.cod_animal);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Animal eliminado correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting animal:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al eliminar el animal'
          });
        }
      });
  }

  /**
   * Guarda un animal (crear o actualizar)
   */
  onSaveAnimal(animalData: AnimalCreateDto | AnimalUpdateDto): void {
    if (this.state.isEditMode()) {
      this.updateAnimal(animalData as AnimalUpdateDto);
    } else {
      this.createAnimal(animalData as AnimalCreateDto);
    }
  }

  /**
   * Crea un nuevo animal
   */
  private createAnimal(animalData: AnimalCreateDto): void {
    console.log('Enviando datos al backend:', animalData);
    
    this.animalsService
      .addAnimal$(animalData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (animal) => {
          this.state.addAnimal(animal);
          this.state.closeDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Animal creado correctamente'
          });
          this.loadAnimals(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error creating animal:', error);
          console.error('Error details:', error.error);
          
          let errorMessage = 'Error al crear el animal';
          
          // Intentar obtener un mensaje más específico
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Si hay errores de validación, mostrar el primero
            const firstError = Object.values(error.error.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
        }
      });
  }

  /**
   * Actualiza un animal existente
   */
  private updateAnimal(animalData: AnimalUpdateDto): void {
    const animal = this.state.selectedAnimal();
    if (!animal) return;

    this.animalsService
      .updateAnimal$(
        animal.cod_finca.toString(),
        animal.cod_animal,
        animalData
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedAnimal) => {
          this.state.updateAnimal(updatedAnimal);
          this.state.closeDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Animal actualizado correctamente'
          });
        },
        error: (error) => {
          console.error('Error updating animal:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar el animal'
          });
        }
      });
  }

  /**
   * Cancela la edición/creación
   */
  onCancelDialog(): void {
    this.state.closeDialog();
  }

  /**
   * Abre diálogo para seleccionar finca criadora
   */
  onSelectCriador(): void {
    this.showFincaCriadorDialog = true;
  }

  /**
   * Abre diálogo para seleccionar finca propietaria
   */
  onSelectPropietario(): void {
    this.showFincaPropietarioDialog = true;
  }

  /**
   * Abre diálogo para seleccionar padre
   */
  onSelectPadre(): void {
    this.showPadreDialog = true;
  }

  /**
   * Abre diálogo para seleccionar madre
   */
  onSelectMadre(): void {
    this.showMadreDialog = true;
  }

  /**
   * Maneja la selección de finca criadora
   */
  onFincaCriadorSelected(finca: FincaDto): void {
    this.selectedFincaCriador = finca;
    this.showFincaCriadorDialog = false;
    
    // Aquí podrías actualizar el formulario si es necesario
    this.messageService.add({
      severity: 'success',
      summary: 'Finca Seleccionada',
      detail: `Finca criadora: ${finca.nomb_finca}`
    });
  }

  /**
   * Maneja la selección de finca propietaria
   */
  onFincaPropietarioSelected(finca: FincaDto): void {
    this.selectedFincaPropietario = finca;
    this.showFincaPropietarioDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Finca Seleccionada',
      detail: `Finca propietaria: ${finca.nomb_finca}`
    });
  }

  /**
   * Maneja la selección de padre
   */
  onPadreSelected(animal: AnimalDto): void {
    // Validar que sea macho
    if (animal.sexo_animal !== 'M') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El padre debe ser un animal macho'
      });
      return;
    }

    this.selectedPadre = animal;
    this.showPadreDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Padre Seleccionado',
      detail: `Padre: ${animal.nomb_animal}`
    });
  }

  /**
   * Maneja la selección de madre
   */
  onMadreSelected(animal: AnimalDto): void {
    // Validar que sea hembra
    if (animal.sexo_animal !== 'H') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La madre debe ser un animal hembra'
      });
      return;
    }

    this.selectedMadre = animal;
    this.showMadreDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Madre Seleccionada',
      detail: `Madre: ${animal.nomb_animal}`
    });
  }

  /**
   * Cierra el diálogo de selección de finca criadora
   */
  closeBreederFarmDialog(): void {
    this.showFincaCriadorDialog = false;
  }

  /**
   * Cierra el diálogo de selección de finca propietaria
   */
  closeOwnerFarmDialog(): void {
    this.showFincaPropietarioDialog = false;
  }

  /**
   * Cierra el diálogo de selección de padre
   */
  closePadreDialog(): void {
    this.showPadreDialog = false;
  }

  /**
   * Cierra el diálogo de selección de madre
   */
  closeMadreDialog(): void {
    this.showMadreDialog = false;
  }

  /**
   * Implementación de CanComponentDeactivate
   * Previene salir de la página si el formulario tiene cambios sin guardar
   */
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Si el diálogo no está visible, permitir navegación
    if (!this.state.dialogVisible()) {
      return true;
    }

    // Si el formulario no está disponible, permitir navegación
    if (!this.animalFormComponent) {
      return true;
    }

    // Verificar si el formulario tiene cambios sin guardar
    const formIsDirty = this.animalFormComponent.animalForm.dirty;
    
    if (formIsDirty) {
      return new Promise<boolean>((resolve) => {
        this.confirmationService.confirm({
          message: '¿Está seguro que desea salir? Los cambios no guardados se perderán.',
          header: 'Confirmar Salida',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sí, salir',
          rejectLabel: 'Cancelar',
          accept: () => {
            resolve(true);
          },
          reject: () => {
            resolve(false);
          }
        });
      });
    }

    return true;
  }
}
