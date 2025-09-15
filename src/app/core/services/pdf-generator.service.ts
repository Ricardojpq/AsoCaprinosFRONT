import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  /**
   * Genera un PDF a partir de elementos HTML
   * @param elements - Array de elementos HTML a convertir
   * @param filename - Nombre del archivo PDF
   * @param orientation - Orientación del PDF ('landscape' | 'portrait')
   */
  async generatePDF(
    elements: HTMLElement[], 
    filename: string = 'certificate.pdf',
    orientation: 'landscape' | 'portrait' = 'landscape'
  ): Promise<void> {
    try {
      // Configuración del PDF en formato horizontal (A4)
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      // Dimensiones del PDF
      const pdfWidth = orientation === 'landscape' ? 297 : 210;
      const pdfHeight = orientation === 'landscape' ? 210 : 297;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Si no es el primer elemento, agregar nueva página
        if (i > 0) {
          pdf.addPage();
        }

        // Esperar a que todas las imágenes se carguen
        await this.waitForImages(element);


        // Configurar opciones para html2canvas
        const canvas = await html2canvas(element, {
          scale: 2, // Reducir escala para evitar problemas de memoria
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: element.offsetWidth || 1123,
          height: element.offsetHeight || 794,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // Asegurar que los estilos se apliquen en el clon
            const clonedElement = clonedDoc.querySelector('[class*="container-certificate"], [class*="certificate-page"]');
            if (clonedElement) {
              (clonedElement as HTMLElement).style.visibility = 'visible';
              (clonedElement as HTMLElement).style.display = 'block';
            }
          }
        });


        // Convertir canvas a imagen
        const imgData = canvas.toDataURL('image/png');
        
        // Calcular dimensiones para ajustar al PDF manteniendo proporción
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        
        // Centrar la imagen en la página
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;

        // Agregar imagen al PDF
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      }

      // Guardar el PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  /**
   * Genera PDF específicamente para certificados y retorna blob
   * @param page1Element - Elemento HTML de la página 1
   * @param page2Element - Elemento HTML de la página 2
   * @param animalName - Nombre del animal para el filename
   * @returns Promise<{blob: Blob, filename: string}>
   */
  async generateCertificatePDFBlob(
    page1Element: HTMLElement,
    page2Element: HTMLElement,
    animalName: string = 'certificado'
  ): Promise<{blob: Blob, filename: string}> {
    try {
      // Configuración del PDF en formato horizontal (A4)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Dimensiones del PDF
      const pdfWidth = 297;
      const pdfHeight = 210;

      // Procesar página 1
      if (page1Element) {
        await this.addElementToPDF(pdf, page1Element, pdfWidth, pdfHeight, false);
      }

      // Procesar página 2 si existe y tiene contenido
      if (page2Element && (page2Element.children.length > 0 || page2Element.textContent?.trim())) {
        pdf.addPage();
        await this.addElementToPDF(pdf, page2Element, pdfWidth, pdfHeight, true);
      }

      // Retornar blob y filename
      const filename = `certificado_${animalName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      const blob = pdf.output('blob');
      
      return { blob, filename };
      
    } catch (error) {
      console.error('Error en generateCertificatePDFBlob:', error);
      throw error;
    }
  }

  /**
   * Genera PDF específicamente para certificados y lo descarga
   * @param page1Element - Elemento HTML de la página 1
   * @param page2Element - Elemento HTML de la página 2
   * @param animalName - Nombre del animal para el filename
   */
  async generateCertificatePDF(
    page1Element: HTMLElement,
    page2Element: HTMLElement,
    animalName: string = 'certificado'
  ): Promise<void> {
    try {
      const { blob, filename } = await this.generateCertificatePDFBlob(page1Element, page2Element, animalName);
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Limpiar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Error en generateCertificatePDF:', error);
      throw error;
    }
  }

  /**
   * Agrega un elemento HTML al PDF
   */
  private async addElementToPDF(
    pdf: jsPDF, 
    element: HTMLElement, 
    pdfWidth: number, 
    pdfHeight: number, 
    isSecondPage: boolean = false
  ): Promise<void> {
    // Esperar a que las imágenes se carguen
    await this.waitForImages(element);

    // Hacer el elemento visible y con dimensiones fijas
    const originalStyle = {
      position: element.style.position,
      visibility: element.style.visibility,
      width: element.style.width,
      height: element.style.height,
      transform: element.style.transform
    };

    element.style.position = 'relative';
    element.style.visibility = 'visible';
    element.style.width = '1123px';
    element.style.height = '794px';
    element.style.transform = 'scale(1)';

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1123,
        height: 794,
        windowWidth: 1123,
        windowHeight: 794,
        onclone: (clonedDoc, clonedElement) => {
          // Asegurar estilos en el elemento clonado
          clonedElement.style.width = '1123px';
          clonedElement.style.height = '794px';
          clonedElement.style.position = 'relative';
          clonedElement.style.visibility = 'visible';
          
          // Aplicar estilos a elementos hijos y convertir colores oklch
          const childElements = clonedElement.querySelectorAll('*');
          childElements.forEach((child: any) => {
            if (child.style) {
              child.style.visibility = 'visible';
              this.convertOklchColors(child);
              this.fixAlignment(child);
            }
          });
          
          // Convertir colores del elemento principal
          this.convertOklchColors(clonedElement);
        }
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas generado está vacío');
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calcular dimensiones manteniendo proporción
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Centrar en la página
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

    } finally {
      // Restaurar estilos originales
      element.style.position = originalStyle.position;
      element.style.visibility = originalStyle.visibility;
      element.style.width = originalStyle.width;
      element.style.height = originalStyle.height;
      element.style.transform = originalStyle.transform;
    }
  }

  /**
   * Prepara elementos para PDF (optimiza estilos)
   * @param element - Elemento a preparar
   */
  prepareElementForPDF(element: HTMLElement): void {
    // Asegurar que las imágenes estén completamente cargadas
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.style.display = 'none';
      }
      // Asegurar que las imágenes tengan crossOrigin configurado
      img.crossOrigin = 'anonymous';
    });

    // Optimizar fuentes para PDF
    element.style.fontFamily = 'Arial, sans-serif';
    
    // Asegurar que el elemento tenga dimensiones fijas
    if (!element.style.width) {
      element.style.width = '1123px';
    }
    if (!element.style.height) {
      element.style.height = '794px';
    }
  }

  /**
   * Espera a que todas las imágenes se carguen
   * @param element - Elemento que contiene las imágenes
   */
  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = Array.from(element.querySelectorAll('img'));
    const imagePromises = images.map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continuar aunque la imagen falle
        }
      });
    });
    
    await Promise.all(imagePromises);
  }

  /**
   * Convierte colores oklch a formatos compatibles con html2canvas
   * @param element - Elemento a procesar
   */
  private convertOklchColors(element: HTMLElement): void {
    const style = getComputedStyle(element);
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
      'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'outlineColor', 'textDecorationColor', 'fill', 'stroke'
    ];

    colorProperties.forEach(prop => {
      const value = style.getPropertyValue(prop);
      if (value && value.includes('oklch')) {
        const convertedColor = this.oklchToRgb(value);
        if (convertedColor) {
          (element.style as any)[prop] = convertedColor;
        }
      }
    });

    // También verificar propiedades CSS personalizadas
    const cssText = element.style.cssText;
    if (cssText.includes('oklch')) {
      const convertedCss = cssText.replace(/oklch\([^)]+\)/g, (match) => {
        const converted = this.oklchToRgb(match);
        return converted || match;
      });
      element.style.cssText = convertedCss;
    }
  }

  /**
   * Convierte un color oklch a RGB
   * @param oklchColor - Color en formato oklch
   * @returns Color en formato RGB o null si no se puede convertir
   */
  private oklchToRgb(oklchColor: string): string | null {
    // Mapeo de colores oklch comunes de Tailwind a RGB
    const colorMap: { [key: string]: string } = {
      // Amarillos (yellow-400 usado en borders)
      'oklch(0.8474 0.199 85.29)': 'rgb(250, 204, 21)',
      'oklch(0.8474 0.199 85.3)': 'rgb(250, 204, 21)',
      'oklch(84.74% 0.199 85.29)': 'rgb(250, 204, 21)',
      
      // Negros
      'oklch(0 0 0)': 'rgb(0, 0, 0)',
      'oklch(0% 0 0)': 'rgb(0, 0, 0)',
      
      // Blancos
      'oklch(1 0 0)': 'rgb(255, 255, 255)',
      'oklch(100% 0 0)': 'rgb(255, 255, 255)',
      
      // Azules (blue-600)
      'oklch(0.5141 0.1969 255.72)': 'rgb(37, 99, 235)',
      'oklch(51.41% 0.1969 255.72)': 'rgb(37, 99, 235)',
      
      // Grises
      'oklch(0.5985 0 0)': 'rgb(107, 114, 128)',
      'oklch(59.85% 0 0)': 'rgb(107, 114, 128)'
    };

    // Normalizar el color (remover espacios extra)
    const normalizedColor = oklchColor.replace(/\s+/g, ' ').trim();
    
    // Buscar coincidencia exacta
    if (colorMap[normalizedColor]) {
      return colorMap[normalizedColor];
    }

    // Si no encuentra coincidencia, intentar extraer valores y convertir manualmente
    const match = normalizedColor.match(/oklch\(\s*([0-9.%]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/);
    if (match) {
      // Conversión básica para casos comunes
      const lightness = parseFloat(match[1].replace('%', '')) / (match[1].includes('%') ? 100 : 1);
      
      // Mapeo simple basado en lightness
      if (lightness > 0.9) return 'rgb(255, 255, 255)'; // Blanco
      if (lightness < 0.1) return 'rgb(0, 0, 0)'; // Negro
      if (lightness > 0.8) return 'rgb(250, 204, 21)'; // Amarillo claro
      if (lightness > 0.5) return 'rgb(107, 114, 128)'; // Gris
      return 'rgb(37, 99, 235)'; // Azul por defecto
    }

    return null;
  }

  /**
   * Corrige problemas de alineación para html2canvas
   * @param element - Elemento a corregir
   */
  private fixAlignment(element: HTMLElement): void {
    const computedStyle = getComputedStyle(element);
    
    // Forzar alineación de texto al centro si tiene text-center
    if (element.classList.contains('text-center')) {
      element.style.textAlign = 'center';
    }
    
    // Forzar alineación al final si tiene text-end
    if (element.classList.contains('text-end')) {
      element.style.textAlign = 'right';
    }
    
    // Forzar justificación de contenido para flexbox
    if (element.classList.contains('justify-center')) {
      element.style.justifyContent = 'center';
      element.style.display = 'flex';
    }
    
    if (element.classList.contains('justify-end')) {
      element.style.justifyContent = 'flex-end';
      element.style.display = 'flex';
    }
    
    if (element.classList.contains('justify-between')) {
      element.style.justifyContent = 'space-between';
      element.style.display = 'flex';
    }
    
    // Forzar alineación de items para flexbox
    if (element.classList.contains('items-center')) {
      element.style.alignItems = 'center';
      element.style.display = 'flex';
    }
    
    if (element.classList.contains('items-end')) {
      element.style.alignItems = 'flex-end';
      element.style.display = 'flex';
    }
    
    // Asegurar que flex funcione correctamente
    if (element.classList.contains('flex')) {
      element.style.display = 'flex';
    }
    
    if (element.classList.contains('flex-col')) {
      element.style.flexDirection = 'column';
      element.style.display = 'flex';
    }
  }
}
