/**
 * Proveedores mock reutilizables para tests de Angular
 * Usar con TestBed.configureTestingModule({ providers: [...] })
 */

/// <reference types="jasmine" />

import { provideHttpClient, HttpFeature, HttpFeatureKind } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal, Provider, EnvironmentProviders } from '@angular/core';
import { 
  MessageService, 
  ConfirmationService,
  Confirmation
} from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

// =====================================================
// MessageService Mock
// =====================================================
export function provideMockMessageService(): { provide: typeof MessageService; useValue: jasmine.SpyObj<MessageService> } {
  const mock = jasmine.createSpyObj<MessageService>('MessageService', ['add', 'clear']);
  return { provide: MessageService, useValue: mock };
}

// =====================================================
// ConfirmationService Mock
// =====================================================
export function provideMockConfirmationService(): { provide: typeof ConfirmationService; useValue: jasmine.SpyObj<ConfirmationService> } {
  const mock = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
  // Default: simulate user accepting confirmation
  mock.confirm.and.callFake((confirmation: Confirmation) => {
    if (confirmation?.accept) {
      confirmation.accept();
    }
    return mock;
  });
  return { provide: ConfirmationService, useValue: mock };
}

// =====================================================
// DialogService Mock
// =====================================================
export function provideMockDialogService(): { provide: typeof DialogService; useValue: jasmine.SpyObj<DialogService> } {
  const mock = jasmine.createSpyObj<DialogService>('DialogService', ['open']);
  mock.open.and.returnValue({
    onClose: of(null)
  } as DynamicDialogRef<unknown>);
  return { provide: DialogService, useValue: mock };
}

// =====================================================
// Router Mock
// =====================================================
export function provideMockRouter(): { provide: typeof Router; useValue: jasmine.SpyObj<Router> } {
  const mock = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
  mock.navigate.and.returnValue(Promise.resolve(true));
  mock.navigateByUrl.and.returnValue(Promise.resolve(true));
  return { provide: Router, useValue: mock };
}

// =====================================================
// ActivatedRoute Mock
// =====================================================
export function provideMockActivatedRoute(params = {}, queryParams = {}): { provide: typeof ActivatedRoute; useValue: any } {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        params: { ...params },
        queryParams: { ...queryParams }
      },
      params: of(params),
      queryParams: of(queryParams)
    }
  };
}

// =====================================================
// FarmContext Mock (servicio de contexto de finca)
// =====================================================
export interface MockFarmContext {
  currentFarm: WritableSignal<any>;
  farmId: WritableSignal<number | null>;
  setFarm: jasmine.Spy;
  clearFarm: jasmine.Spy;
}

export function provideMockFarmContext(initialFarm: any = null): { provide: any; useValue: MockFarmContext } {
  const mock: MockFarmContext = {
    currentFarm: signal(initialFarm),
    farmId: signal(initialFarm?.cod_finca || null),
    setFarm: jasmine.createSpy('setFarm'),
    clearFarm: jasmine.createSpy('clearFarm')
  };
  return { provide: 'FarmContextService', useValue: mock };
}

// =====================================================
// HTTP Testing Setup
// =====================================================
export type HttpTestingProvider = Provider | EnvironmentProviders;

export function provideHttpTesting(): HttpTestingProvider[] {
  return [
    provideHttpClient(),
    provideHttpClientTesting()
  ];
}

// =====================================================
// Combo común para componentes CRUD
// =====================================================
export function provideCrudTestingMocks(): any[] {
  return [
    provideMockMessageService(),
    provideMockConfirmationService(),
    provideMockRouter(),
    ...provideHttpTesting()
  ];
}
