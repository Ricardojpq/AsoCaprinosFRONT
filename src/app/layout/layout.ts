import {
  Component,
  computed,
  effect,
  OnDestroy,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '@layout/services/layout-service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '@layout/components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { FincaSelectorComponent } from './components/finca-selector/finca-selector';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { AppLoading } from '@shared/components/loading/loading';
import { LoadingService } from '@core/services/loading.service';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    Sidebar,
    Navbar,
    Footer,
    FincaSelectorComponent,
    StyleClassModule,
    ButtonModule,
    AppLoading,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnDestroy {
  overlayMenuOpenSubscription: Subscription;

  menuOutsideClickListener: any;

  @ViewChild(Sidebar) appSidebar!: Sidebar;

  @ViewChild(Navbar) appTopBar!: Navbar;

  loadingService = inject(LoadingService);
  loading = this.loadingService.loading;

  constructor(
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router,
    private authService: AuthService
  ) {
    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        if (!this.menuOutsideClickListener) {
          this.menuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              if (this.isOutsideClicked(event)) {
                this.hideMenu();
              }
            }
          );
        }

        if (this.layoutService.layoutState().staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideMenu();
      });
  }

  get currentUser() {
    return this.authService.user();
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) ||
      sidebarEl?.contains(eventTarget) ||
      topbarEl?.isSameNode(eventTarget) ||
      topbarEl?.contains(eventTarget)
    );
  }

  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  get containerClass() {
    return {
      'layout-overlay':
        this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.layoutState().staticMenuDesktopInactive &&
        this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active':
        this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active':
        this.layoutService.layoutState().staticMenuMobileActive,
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
