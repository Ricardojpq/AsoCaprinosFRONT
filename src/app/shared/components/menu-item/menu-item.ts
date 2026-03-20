import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LayoutService } from '@layout/services/layout-service';
import { RippleModule } from 'primeng/ripple';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { filter, Subscription } from 'rxjs';
// import { MenuItem } from 'primeng/api';
import { MenuItem } from '@core/models/menu-item';
import { LucideAngularModule } from "lucide-angular";
@Component({
  selector: '[app-menuitem]',
  imports: [CommonModule, RouterModule, RippleModule, LucideAngularModule],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
   animations: [
        trigger('children', [
            state(
                'collapsed',
                style({
                    height: '0'
                })
            ),
            state(
                'expanded',
                style({
                    height: '*'
                })
            ),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ],
    providers: [LayoutService]
})
export class AppMenuItem {
    @Input() item!: MenuItem;

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    active = false;

    menuSourceSubscription: any;

    menuResetSubscription: any;

    key: string = '';

    constructor(
        public router: Router,
        private layoutService: LayoutService
    ) {
        // this.menuSourceSubscription = this.layoutService.menuSource$.subscribe((value) => {
        //     Promise.resolve(null).then(() => {
        //         if (value.routeEvent) {
        //             this.active = value.key === this.key || value.key.startsWith(this.key + '-') ? true : false;
        //         } else {
        //             if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
        //                 this.active = false;
        //             }
        //         }
        //     });
        // });

        // this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
        //     this.active = false;
        // });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((params) => {
            if (this.item.routerLink) {
                this.updateActiveStateFromRoute();
            }
        });
    }

    ngOnInit() {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

        if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        let activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });

        if (activeRoute) {
            // this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }

    itemClick(event: Event) {
        // avoid processing disabled items
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        // Si tiene routerLink y no tiene items hijos, dejar que Angular maneje la navegación
        if (this.item.routerLink && !this.item.items) {
            return;
        }

        // toggle active state solo para items con subitems
        if (this.item.items) {
            this.active = !this.active;
        }
    }

    get submenuAnimation() {
        return this.root ? 'expanded' : this.active ? 'expanded' : 'collapsed';
    }

    @HostBinding('class.active-menuitem')
    get activeClass() {
        return this.active && !this.root;
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}
