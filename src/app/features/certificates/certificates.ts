import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { Table } from 'primeng/table';
import { GalleriaModule } from 'primeng/galleria';
import {
  LucideAngularModule,
  PrinterCheck,
  Trash2,
  Plus,
  Upload,
  Search,
  Eye,
  X,
  User,
  Info,
} from 'lucide-angular';
import { CertificatesService } from './services/certificates-service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CertificateViewer } from './components/certificate-viewer/certificate-viewer';
import { PdfGeneratorService } from '@core/services/pdf-generator.service';
import {
  CertificateDto,
  CertificateTableData,
  CertificateFormData,
  CreateCertificateDto,
} from './models/certificate.dto';
import { CertificatePage1 } from './components/certificate-page1/certificate-page1';
import { CertificatePage2 } from './components/certificate-page2/certificate-page2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimalsTable, AnimalSelectionDto } from './components/animals-table/animals-table';
import { ClasificadoresTable, ClasificadorSelectionDto } from './components/clasificadores-table/clasificadores-table';
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-certificates',
  imports: [
    FormsModule,
    GalleriaModule,
    ButtonModule,
    FileUploadModule,
    DialogModule,
    SelectModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputGroupModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    LucideAngularModule,
    TextareaModule,
    ProgressSpinnerModule,
    CertificateViewer,
    CertificatePage1,
    CertificatePage2,
    AnimalsTable,
    ClasificadoresTable,
  ],
  templateUrl: './certificates.html',
  styleUrl: './certificates.css',
  providers: [MessageService, ConfirmationService],
})
export class Certificates implements OnInit {
  readonly trashIcon = Trash2;
  readonly printerIcon = PrinterCheck;
  readonly plusIcon = Plus;
  readonly uploadIcon = Upload;
  readonly searchIcon = Search;
  readonly eyeIcon = Eye;
  readonly xIcon = X;
  readonly userIcon = User;
  readonly infoIcon = Info;

  @ViewChild('certificatePage1', { read: ElementRef }) page1Ref!: ElementRef;
  @ViewChild('certificatePage2', { read: ElementRef }) page2Ref!: ElementRef;

  isLoading = false;
  pdfUrl: SafeResourceUrl | null = null;
  error: string | null = null;

  certificateDialog: boolean = false;

  certificates: CertificateTableData[] = [];

  certificate: CreateCertificateDto = this.getEmptyCreateCertificate();
  isEditMode: boolean = false;
  editCertificate: CertificateFormData = this.getEmptyCertificate();

  selectedCertificates: CertificateTableData[] | null = null;

  submitted: boolean = false;

  // Paginación
  currentPage: number = 1;
  totalRecords: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  downloadLoading: boolean = false;

  // Filtros
  searchTerm: string = '';
  filters = {
    cod_animal: '',
    cod_criador: '',
    cod_propietario: '',
  };

  @ViewChild('dt') dt!: Table;

  cols!: Column[];
  
  // Propiedades para manejo de carga de datos
  waitingForDataLoad: boolean = false;
  isDownloadMode: boolean = false;

  exportColumns!: ExportColumn[];

  // Modal para visualizar PDF
  pdfViewerDialog: boolean = false;

  certificateData!: CertificateDto;

  // Modals para selección
  showAnimalsDialog: boolean = false;
  showClasificadoresDialog: boolean = false;

  // Datos seleccionados
  selectedAnimalData: AnimalSelectionDto | null = null;
  selectedClasificadorData: ClasificadorSelectionDto | null = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private certificatesService: CertificatesService,
    private pdfGeneratorService: PdfGeneratorService,
    private sanitizer: DomSanitizer
  ) {}

  exportCSV(event: any) {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadCertificatesData();
  }

  loadCertificatesData() {
    this.loading = true;

    const searchFilters = {
      ...this.filters,
      search: this.searchTerm || undefined,
    };

    this.certificatesService
      .getCertificates(this.currentPage, this.pageSize, searchFilters)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            // Convertir los datos del backend al formato de tabla
            this.certificates = this.certificatesService.mapToTableData(
              response.data.data
            );
            this.totalRecords = response.data.total;
            this.currentPage = response.data.current_page;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading certificates:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar certificados',
          });
          this.loading = false;
        },
      });

    this.cols = [
      { field: 'numero_certificado', header: 'Número de Certificado' },
      { field: 'nomb_animal', header: 'Nombre del Animal' },
      { field: 'cod_animal', header: 'Código del Animal' },
      { field: 'nombre_criador', header: 'Criador' },
      { field: 'nombre_propietario', header: 'Propietario' },
      { field: 'nombre_clasificador', header: 'Clasificador' },
      { field: 'fecha_emision', header: 'Fecha de Emisión' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  openNew() {
    this.certificate = this.getEmptyCreateCertificate();
    this.isEditMode = false;
    this.submitted = false;
    this.selectedAnimalData = null;
    this.selectedClasificadorData = null;
    this.certificateDialog = true;
  }

  private getEmptyCreateCertificate(): CreateCertificateDto {
    return {
      cod_animal: '',
      ced_clasificador: '',
      observaciones: '',
    };
  }

  private getEmptyCertificate(): CertificateFormData {
    return {
      cod_animal: '',
      cod_finca: '',
      cod_criador: '',
      cod_propietario: '',
      cod_clasificador: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      observaciones: '',
    };
  }

  async viewCertificate(certificate: CertificateTableData) {
    if (!certificate.id) return;

    try {
      // Limpiar datos anteriores
      this.clearCertificateData();
      
      this.pdfViewerDialog = true;
      this.isLoading = true;
      this.waitingForDataLoad = true; // Flag para indicar que estamos esperando la carga

      this.certificatesService
        .getCertificateWithCompleteInfo(certificate.id)
        .subscribe({
          next: async (response: any) => {
            if (response.status === 'success' && response.data) {
              this.certificateData = response.data;
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.waitingForDataLoad = false;
            console.error('Error loading certificate info:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar información del certificado',
            });
          },
        });
    } catch (error) {
      console.error(error);
      this.isLoading = false;
      this.waitingForDataLoad = false;
    }
  }

  async handleDownloadCertificate(certificate: CertificateTableData) {
    if (!certificate.id) return;
    this.messageService.add({
      severity: 'info',
      summary: 'Procesando descarga',
      detail: 'Generando PDF, por favor espere...',
    });
    try {
      this.waitingForDataLoad = true;
      this.isDownloadMode = true;

      this.certificatesService
        .getCertificateWithCompleteInfo(certificate.id)
        .subscribe({
          next: async (response: any) => {
            if (response.status === 'success' && response.data) {
              this.certificateData = response.data;
            }
          },
          error: (error) => {
            this.waitingForDataLoad = false;
            this.isDownloadMode = false;
            console.error('Error loading certificate info:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar información del certificado',
            });
          },
        });
    } catch (error) {
      console.error(error);
      this.waitingForDataLoad = false;
      this.isDownloadMode = false;
    }
  }

  deleteSelectedCertificates() {
    if (!this.selectedCertificates || this.selectedCertificates.length === 0)
      return;

    this.confirmationService.confirm({
      message:
        '¿Está seguro de que desea eliminar los certificados seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'secondary',
        variant: 'text',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Sí',
      },
      accept: () => {
        // Eliminar certificados uno por uno
        let deletedCount = 0;
        let totalToDelete = this.selectedCertificates!.filter(cert => cert.id).length;
        
        if (totalToDelete === 0) return;

        this.selectedCertificates!.forEach((cert) => {
          if (cert.id) {
            this.certificatesService.deleteCertificate(cert.id).subscribe({
              next: (response: any) => {
                if (response.status === 'success') {
                  deletedCount++;
                  if (deletedCount === totalToDelete) {
                    // Todos los certificados han sido eliminados
                    this.loadCertificatesData();
                    this.selectedCertificates = null;
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Exitoso',
                      detail: 'Certificados eliminados correctamente',
                      life: 3000,
                    });
                  }
                }
              },
              error: (error) => {
                console.error('Error deleting certificate:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar algunos certificados',
                });
              }
            });
          }
        });
      },
    });
  }

  hideDialog() {
    this.certificateDialog = false;
    this.submitted = false;
    this.selectedAnimalData = null;
    this.selectedClasificadorData = null;
  }

  deleteCertificate(certificate: CertificateTableData) {
    if (!certificate.id) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el certificado ${certificate.numero_certificado}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'secondary',
        variant: 'text',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Sí',
      },
      accept: () => {
        this.certificatesService.deleteCertificate(certificate.id!).subscribe({
          next: (response: any) => {
            if (response.status === 'success') {
              this.loadCertificatesData();
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Certificado eliminado correctamente',
                life: 3000,
              });
            }
          },
          error: (error) => {
            console.error('Error deleting certificate:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar certificado',
            });
          },
        });
      },
    });
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.certificates.length; i++) {
      if (this.certificates[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    var chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  formatDate(dateString: string): string {
    return this.certificatesService.formatDate(dateString);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadCertificatesData();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.loadCertificatesData();
  }

  editCertificateData(certificate: CertificateTableData) {
    if (!certificate.id) return;

    this.certificatesService.getCertificateById(certificate.id).subscribe({
      next: (response: any) => {
        if (
          (response.status === 'success') &&
          response.data
        ) {
          this.editCertificate = {
            id: response.data.id,
            cod_animal: response.data.cod_animal || '',
            cod_finca: response.data.cod_finca || '',
            cod_criador: response.data.cod_criador || '',
            cod_propietario: response.data.cod_propietario || '',
            cod_clasificador: response.data.cod_clasificador || '',
            fecha_emision: response.data.fecha_emision || '',
            observaciones: response.data.observaciones || '',
          };
          this.isEditMode = true;
          this.certificateDialog = true;
        }
      },
      error: (error) => {
        console.error('Error loading certificate:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar certificado',
        });
      },
    });
  }

  saveCertificate() {
    this.submitted = true;

    if (this.isEditMode) {
      // Actualizar certificado existente
      const errors = this.certificatesService.validateCertificateData(
        this.editCertificate
      );
      if (errors.length > 0) {
        errors.forEach((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: error,
          });
        });
        return;
      }

      this.certificatesService
        .updateCertificate(this.editCertificate.id!, this.editCertificate)
        .subscribe({
          next: (response: any) => {
            if (response.status === 'success') {
              // Cerrar modal
              this.certificateDialog = false;
              // Limpiar formularios
              this.certificate = this.getEmptyCreateCertificate();
              this.editCertificate = this.getEmptyCertificate();
              // Refrescar tabla
              this.loadCertificatesData();
              // Mostrar mensaje de éxito
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Certificado actualizado correctamente',
                life: 3000,
              });
            }
          },
          error: (error) => {
            console.error('Error updating certificate:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar certificado',
            });
          },
        });
    } else {
      // Crear nuevo certificado (método simplificado)
      const errors = this.certificatesService.validateCreateCertificateData(
        this.certificate
      );
      if (errors.length > 0) {
        errors.forEach((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: error,
          });
        });
        return;
      }

      this.certificatesService.createCertificate(this.certificate).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Cerrar modal
            this.certificateDialog = false;
            // Limpiar formulario
            this.certificate = this.getEmptyCreateCertificate();
            // Refrescar tabla
            this.loadCertificatesData();
            // Mostrar mensaje de éxito
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Certificado creado correctamente',
              life: 3000,
            });
          }
        },
        error: (error) => {
          console.error('Error creating certificate:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear certificado',
          });
        },
      });
    }
  }

  /**
   * Cierra el modal del visor de PDF y limpia la URL
   */
  closePdfViewer() {
    this.pdfViewerDialog = false;
  }

  /**
   * Limpia los datos del certificado anterior
   */
  private clearCertificateData() {
    this.certificateData = {} as CertificateDto;
    this.pdfUrl = null;
    this.error = null;
    this.waitingForDataLoad = false;
    this.isDownloadMode = false;
  }

  /**
   * Método llamado cuando todos los datos han sido cargados en los componentes
   */
  async onAllDataLoaded() {
    if (this.waitingForDataLoad) {
      console.log('Todos los datos han sido cargados, procesando...');
      this.waitingForDataLoad = false;
      
      try {
        if (this.isDownloadMode) {
          // Modo descarga
          console.log('Ejecutando descarga de PDF...');
          await this.downloadCertificate();
          this.isDownloadMode = false;
        } else {
          // Modo visualización
          console.log('Generando PDF para visualización...');
          let success = await this.generatePDFForViewing();
          if (success) {
            this.isLoading = false;
          }
        }
      } catch (error) {
        console.error('Error al procesar PDF después de cargar datos:', error);
        this.isLoading = false;
        this.isDownloadMode = false;
        this.error = 'Error al generar el PDF: ' + (error as Error).message;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el PDF',
        });
      }
    }
  }

  /**
   * Genera el PDF para visualización embebida
   */
  async generatePDFForViewing(): Promise<boolean> {
    try {
      this.error = null;

      if (!this.page1Ref?.nativeElement) {
        throw new Error('No se encontró el elemento de la página 1');
      }

      // Buscar el elemento real del certificado dentro del contenedor
      const page1Element =
        this.page1Ref.nativeElement.querySelector('app-certificate-page1') ||
        this.page1Ref.nativeElement.querySelector('.container-certificate') ||
        this.page1Ref.nativeElement;

      const page2Element =
        this.page2Ref?.nativeElement.querySelector('app-certificate-page2') ||
        this.page2Ref?.nativeElement.querySelector('.certificate-page-2') ||
        this.page2Ref?.nativeElement;

      const animalName =
        this.certificateData?.animal?.nomb_animal || 'certificado';

      // Generar PDF como blob
      const { blob } =
        await this.pdfGeneratorService.generateCertificatePDFBlob(
          page1Element as HTMLElement,
          page2Element as HTMLElement,
          animalName
        );

      // Crear URL para el PDF embebido
      const url = URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.error = 'Error al generar el PDF: ' + (error as Error).message;
      return false;
    }
  }

  /**
   * Descarga el PDF del certificado
   */
  async downloadCertificate(): Promise<void> {
    this.downloadLoading = true;
    
    try {
      if (!this.page1Ref?.nativeElement) {
        throw new Error('No se encontró el elemento de la página 1');
      }

      const page1Element =
        this.page1Ref.nativeElement.querySelector('app-certificate-page1') ||
        this.page1Ref.nativeElement.querySelector('.container-certificate') ||
        this.page1Ref.nativeElement;

      const page2Element =
        this.page2Ref?.nativeElement.querySelector('app-certificate-page2') ||
        this.page2Ref?.nativeElement.querySelector('.certificate-page-2') ||
        this.page2Ref?.nativeElement;

      const animalName =
        this.certificateData?.animal?.nomb_animal || 'certificado';

      await this.pdfGeneratorService.generateCertificatePDF(
        page1Element as HTMLElement,
        page2Element as HTMLElement,
        animalName
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'PDF descargado correctamente',
      });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al descargar el PDF',
      });
    } finally {
      this.downloadLoading = false;
    }
  }

  // Métodos para manejo de selección de animales
  openAnimalsDialog() {
    this.showAnimalsDialog = true;
  }

  onAnimalSelected(animal: AnimalSelectionDto) {
    this.selectedAnimalData = animal;
    this.certificate.cod_animal = animal.cod_animal;
    this.showAnimalsDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Animal Seleccionado',
      detail: `Animal: ${animal.nomb_animal} (${animal.cod_animal})`,
      life: 3000
    });
  }

  clearAnimalSelection() {
    this.selectedAnimalData = null;
    this.certificate.cod_animal = '';
  }

  // Métodos para manejo de selección de clasificadores
  openClasificadoresDialog() {
    this.showClasificadoresDialog = true;
  }

  onClasificadorSelected(clasificador: ClasificadorSelectionDto) {
    this.selectedClasificadorData = clasificador;
    this.certificate.ced_clasificador = clasificador.ced_clasificador;
    this.showClasificadoresDialog = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Clasificador Seleccionado',
      detail: `Clasificador: ${clasificador.nom_persona} ${clasificador.ape_persona}`,
      life: 3000
    });
  }

  clearClasificadorSelection() {
    this.selectedClasificadorData = null;
    this.certificate.ced_clasificador = '';
  }
}
