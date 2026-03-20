import { QueryParamsHandling } from "@angular/router";
import { LucideIconData } from "lucide-angular";

export interface MenuItem {
    label?: string;
    icon?: LucideIconData;
    routerLink?: any;
    routerLinkActiveOptions?: any;
    items?: MenuItem[];
    url?: string;
    target?: string;
    separator?: boolean;
    disabled?: boolean;
    visible?: boolean;
    styleClass?: string;
    /**
     * Vista/ruta del módulo para verificar permisos.
     * Si no se especifica, se usa el routerLink.
     */
    moduleVista?: string;

    /**
    * Sets the hash fragment for the URL.
    */
    fragment?: string;
    /**
     *  How to handle query parameters in the router link for the next navigation. One of:
        merge : Merge new with current parameters.
        preserve : Preserve current parameters.k.
     */
    queryParamsHandling?: QueryParamsHandling;
    /**
     * When true, preserves the URL fragment for the next navigation.
     */
    preserveFragment?: boolean;
    /**
     * When true, navigates while replacing the current state in history.
     */
    replaceUrl?: boolean;
    /**
    * Developer-defined state that can be passed to any navigation.
    */
    state?: {
        [k: string]: any;
    };
    /**
     * When true, navigates without pushing a new state into history.
     */
    skipLocationChange?: boolean;
    /**
     * Query parameters for internal navigation via routerLink.
     */
    queryParams?: {
        [k: string]: any;
    };
    badgeClass?: string; // Added property to fix error

}