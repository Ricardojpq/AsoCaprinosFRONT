import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  GitFork,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Mars,
  Venus,
  User,
  Dna,
} from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PedigreeService } from '../../services/pedigree.service';
import { PedigreeNode } from '../../models/interfaces/pedigree.interface';
import { FarmContextService } from '../../../../core/services/farm-context.service';
import { AnimalDto } from '../../models/DTOs/animal';

interface NodeLayout {
  node: PedigreeNode;
  x: number;
  y: number;
  generation: number;
  side: 'father' | 'mother' | 'root';
  collapsed: boolean;
  uniqueKey: string;
}

@Component({
  selector: 'app-pedigree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pedigree.html',
  styleUrl: './pedigree.css',
})
export class PedigreePage {
  private pedigreeService = inject(PedigreeService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private farmContext = inject(FarmContextService);

  readonly selectedFinca = computed(() => this.farmContext.getSelectedFarm());

  fichaAnimal = signal<AnimalDto | null>(null);
  fichaLoading = signal(false);
  fichaVisible = signal(false);

  readonly gitForkIcon = GitFork;
  readonly searchIcon = Search;
  readonly refreshIcon = RefreshCw;
  readonly chevronDownIcon = ChevronDown;
  readonly chevronRightIcon = ChevronRight;
  readonly alertIcon = AlertCircle;
  readonly xIcon = X;
  readonly externalIcon = ExternalLink;
  readonly zoomInIcon = ZoomIn;
  readonly zoomOutIcon = ZoomOut;
  readonly maximizeIcon = Maximize2;
  readonly maleIcon = Mars;
  readonly femaleIcon = Venus;
  readonly userIcon = User;
  readonly dnaIcon = Dna;

  searchCodAnimal = signal('');

  root = signal<PedigreeNode | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  collapsedKeys = signal<Set<string>>(new Set());
  highlightedKeys = signal<Set<string>>(new Set());
  selectedKey = signal<string | null>(null);

  zoom = signal(0.85);
  panX = signal(0);
  panY = signal(0);

  @ViewChild('canvasEl') private canvasEl!: ElementRef<HTMLDivElement>;

  panning = signal(false);
  private _panning = false;
  private _panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private _ngZone = inject(NgZone);
  private _boundMouseMove!: (e: MouseEvent) => void;
  private _boundMouseUp!: () => void;

  editingInbreedingKey = signal<string | null>(null);
  inbreedingInput = signal<number | null>(null);
  savingInbreeding = signal(false);

  expandingKey = signal<string | null>(null);

  readonly NODE_W = 200;
  readonly NODE_H = 145;
  readonly H_GAP = 60;
  readonly V_GAP = 50;

  readonly layout = computed(() => {
    const root = this.root();
    if (!root) return { nodes: [], svgW: 0, svgH: 0 };

    const nodes: NodeLayout[] = [];
    const collapsedKeys = this.collapsedKeys();

    const placeLeafSlots = (node: PedigreeNode): number => {
      const key = this.nodeKey(node);
      const collapsed = collapsedKeys.has(key);
      if (collapsed || (!node.padre && !node.madre)) return 1;
      return (node.padre ? placeLeafSlots(node.padre) : 1) +
             (node.madre ? placeLeafSlots(node.madre) : 1);
    };

    let leafSlotY = 20;

    const buildLayout = (
      node: PedigreeNode,
      gen: number,
      side: 'father' | 'mother' | 'root',
      path: string
    ): NodeLayout => {
      const nodeKey = this.nodeKey(node);
      const collapsed = collapsedKeys.has(nodeKey);
      const x = 20 + gen * (this.NODE_W + this.H_GAP);

      let fatherNL: NodeLayout | null = null;
      let motherNL: NodeLayout | null = null;

      if (!collapsed) {
        if (node.padre) fatherNL = buildLayout(node.padre, gen + 1, 'father', path + 'P');
        if (node.madre) motherNL = buildLayout(node.madre, gen + 1, 'mother', path + 'M');
      }

      let y: number;
      if (fatherNL && motherNL) {
        y = (fatherNL.y + motherNL.y) / 2;
      } else if (fatherNL) {
        y = fatherNL.y;
      } else if (motherNL) {
        y = motherNL.y;
      } else {
        y = leafSlotY;
        leafSlotY += this.NODE_H + this.V_GAP;
      }

      const nl: NodeLayout = { node, x, y, generation: gen, side, collapsed, uniqueKey: path };
      nodes.push(nl);
      return nl;
    };

    buildLayout(root, 0, 'root', 'root');

    const maxX = nodes.reduce((m, n) => Math.max(m, n.x), 0) + this.NODE_W + 40;
    const maxY = nodes.reduce((m, n) => Math.max(m, n.y), 0) + this.NODE_H + 40;
    return { nodes, svgW: maxX, svgH: maxY };
  });

  readonly svgConnections = computed(() => {
    const { nodes } = this.layout();
    const highlighted = this.highlightedKeys();
    const paths: { d: string; side: 'father' | 'mother'; highlight: boolean; key: string }[] = [];

    for (const n of nodes) {
      if (n.generation === 0) continue;
      const parentNL = this.findParentLayout(nodes, n);
      if (!parentNL) continue;

      const x1 = parentNL.x + this.NODE_W;
      const y1 = parentNL.y + this.NODE_H / 2;
      const x2 = n.x;
      const y2 = n.y + this.NODE_H / 2;
      const mx = (x1 + x2) / 2;

      paths.push({
        d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
        side: n.side === 'father' ? 'father' : 'mother',
        highlight: highlighted.has(n.uniqueKey) || highlighted.has(parentNL.uniqueKey),
        key: `${parentNL.uniqueKey}-${n.uniqueKey}`,
      });
    }
    return paths;
  });

  private findParentLayout(nodes: NodeLayout[], child: NodeLayout): NodeLayout | null {
    if (child.generation === 0) return null;
    for (const n of nodes) {
      if (n.generation !== child.generation - 1) continue;
      if (child.side === 'father' &&
          n.node.cod_animal === child.node.cod_padre &&
          n.node.cod_finca === child.node.cod_finca_padre) return n;
      if (child.side === 'mother' &&
          n.node.cod_animal === child.node.cod_madre &&
          n.node.cod_finca === child.node.cod_finca_madre) return n;
    }
    return null;
  }

  nodeKey(node: PedigreeNode): string {
    return `${node.cod_finca}-${node.cod_animal}`;
  }

  search(): void {
    const finca = this.farmContext.getSelectedFarm();
    const cod = this.searchCodAnimal().trim();

    this.error.set(null);
    this.root.set(null);
    this.collapsedKeys.set(new Set());
    this.highlightedKeys.set(new Set());
    this.selectedKey.set(null);

    if (!finca) { this.error.set('No hay finca seleccionada. Selecciona una finca en el menú superior.'); return; }
    if (!cod) { this.error.set('Ingresa el código del animal'); return; }

    this.loading.set(true);
    this.pedigreeService.getByCode$(finca, cod, 3).subscribe({
      next: node => { this.root.set(node); this.loading.set(false); this.fitToView(); },
      error: () => { this.error.set('Animal no encontrado en esta finca'); this.loading.set(false); },
    });
  }

  toggleCollapse(node: PedigreeNode): void {
    const key = this.nodeKey(node);
    const current = new Set(this.collapsedKeys());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.collapsedKeys.set(current);
  }

  selectNode(node: PedigreeNode): void {
    const key = this.nodeKey(node);
    if (this.selectedKey() === key) {
      this.selectedKey.set(null);
      this.highlightedKeys.set(new Set());
      return;
    }
    this.selectedKey.set(key);
    const highlighted = new Set<string>();
    this.collectAncestors(this.root()!, key, highlighted);
    this.highlightedKeys.set(highlighted);
  }

  private collectAncestors(
    current: PedigreeNode,
    targetKey: string,
    result: Set<string>
  ): boolean {
    const key = this.nodeKey(current);
    if (key === targetKey) {
      result.add(key);
      return true;
    }
    let found = false;
    if (current.padre) {
      if (this.collectAncestors(current.padre, targetKey, result)) {
        result.add(key);
        found = true;
      }
    }
    if (current.madre) {
      if (this.collectAncestors(current.madre, targetKey, result)) {
        result.add(key);
        found = true;
      }
    }
    return found;
  }

  expandNode(node: PedigreeNode): void {
    const key = this.nodeKey(node);
    this.expandingKey.set(key);
    this.pedigreeService.expandNode$(node.cod_finca, node.cod_animal, 3).subscribe({
      next: expanded => {
        this.mergeNode(this.root()!, node.cod_finca, node.cod_animal, expanded);
        this.root.set({ ...this.root()! });
        this.expandingKey.set(null);
      },
      error: () => { this.expandingKey.set(null); },
    });
  }

  private mergeNode(
    current: PedigreeNode,
    codFinca: number,
    codAnimal: string,
    expanded: PedigreeNode
  ): boolean {
    if (current.cod_finca === codFinca && current.cod_animal === codAnimal) {
      current.padre = expanded.padre;
      current.madre = expanded.madre;
      current.has_more = expanded.has_more;
      return true;
    }
    if (current.padre && this.mergeNode(current.padre, codFinca, codAnimal, expanded)) return true;
    if (current.madre && this.mergeNode(current.madre, codFinca, codAnimal, expanded)) return true;
    return false;
  }

  startEditInbreeding(node: PedigreeNode): void {
    if (node.es_externo) return;
    this.editingInbreedingKey.set(this.nodeKey(node));
    this.inbreedingInput.set(node.coef_consanguinidad);
  }

  cancelEditInbreeding(): void {
    this.editingInbreedingKey.set(null);
    this.inbreedingInput.set(null);
  }

  saveInbreeding(node: PedigreeNode): void {
    const val = this.inbreedingInput();
    if (val === null || val < 0 || val > 100) return;
    this.savingInbreeding.set(true);
    this.pedigreeService.updateInbreeding$(node.cod_finca, node.cod_animal, { coef_consanguinidad: val }).subscribe({
      next: res => {
        this.patchNodeInbreeding(this.root()!, node.cod_finca, node.cod_animal, res.coef_consanguinidad);
        this.root.set({ ...this.root()! });
        this.editingInbreedingKey.set(null);
        this.inbreedingInput.set(null);
        this.savingInbreeding.set(false);
      },
      error: () => { this.savingInbreeding.set(false); },
    });
  }

  private patchNodeInbreeding(
    current: PedigreeNode,
    codFinca: number,
    codAnimal: string,
    value: number
  ): boolean {
    if (current.cod_finca === codFinca && current.cod_animal === codAnimal) {
      current.coef_consanguinidad = value;
      return true;
    }
    if (current.padre && this.patchNodeInbreeding(current.padre, codFinca, codAnimal, value)) return true;
    if (current.madre && this.patchNodeInbreeding(current.madre, codFinca, codAnimal, value)) return true;
    return false;
  }

  inbreedingColor(val: number | null): string {
    if (val === null) return 'ib-neutral';
    if (val < 2) return 'ib-ok';
    if (val <= 5) return 'ib-warn';
    return 'ib-danger';
  }

  inbreedingBg(val: number | null): string {
    if (val === null) return 'ib-bg-neutral';
    if (val < 2) return 'ib-bg-ok';
    if (val <= 5) return 'ib-bg-warn';
    return 'ib-bg-danger';
  }

  nodeBorderClass(node: PedigreeNode, gen: number): string {
    if (node.es_externo) return 'border-dashed border-gray-300';
    if (gen === 0) return 'border-amber-400 shadow-amber-100';
    if (node.sexo === 'M') return 'border-blue-400 shadow-blue-100';
    if (node.sexo === 'H') return 'border-pink-400 shadow-pink-100';
    return 'border-gray-300';
  }

  nodeHeaderBg(node: PedigreeNode, gen: number): string {
    if (node.es_externo) return 'node-header-ext';
    if (gen === 0) return 'node-header-root';
    if (node.sexo === 'M') return 'node-header-male';
    if (node.sexo === 'H') return 'node-header-female';
    return 'node-header-ext';
  }

  isSelected(node: PedigreeNode): boolean {
    return this.selectedKey() === this.nodeKey(node);
  }

  isHighlighted(node: PedigreeNode): boolean {
    return this.highlightedKeys().has(this.nodeKey(node));
  }

  zoomIn(): void { this.zoom.set(Math.min(2.5, +(this.zoom() + 0.15).toFixed(2))); }
  zoomOut(): void { this.zoom.set(Math.max(0.2, +(this.zoom() - 0.15).toFixed(2))); }
  fitToView(): void { this.zoom.set(0.85); this.panX.set(0); this.panY.set(0); }

  onCanvasMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this._panning = true;
    this.panning.set(true);
    this._panStart = { x: e.clientX, y: e.clientY, panX: this.panX(), panY: this.panY() };
    this._lastPanX = this.panX();
    this._lastPanY = this.panY();
    e.preventDefault();

    this._boundMouseMove = (ev: MouseEvent) => {
      if (!this._panning) return;
      const dx = (ev.clientX - this._panStart.x) / this.zoom();
      const dy = (ev.clientY - this._panStart.y) / this.zoom();
      const nx = this._panStart.panX + dx;
      const ny = this._panStart.panY + dy;
      if (this.canvasEl) {
        this.canvasEl.nativeElement.style.transform =
          `scale(${this.zoom()}) translate(${nx}px, ${ny}px)`;
      }
      this._lastPanX = nx;
      this._lastPanY = ny;
    };

    this._boundMouseUp = () => {
      this._panning = false;
      this.panning.set(false);
      this.panX.set(this._lastPanX);
      this.panY.set(this._lastPanY);
      window.removeEventListener('mousemove', this._boundMouseMove);
      window.removeEventListener('mouseup', this._boundMouseUp);
    };

    this._ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this._boundMouseMove);
      window.addEventListener('mouseup', this._boundMouseUp);
    });
  }

  private _lastPanX = 0;
  private _lastPanY = 0;

  onCanvasMouseUp(): void { /* handled by window listener */ }

  onCanvasWheel(e: WheelEvent): void {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom.set(Math.min(2.5, Math.max(0.2, +(this.zoom() + delta).toFixed(2))));
  }

  openFicha(node: PedigreeNode): void {
    if (node.es_externo) return;
    this.fichaVisible.set(true);
    this.fichaAnimal.set(null);
    this.fichaLoading.set(true);
    const url = `${environment.apiUrl}/api/v1/animals/${node.cod_finca}/${encodeURIComponent(node.cod_animal)}`;
    this.http.get<{ data: AnimalDto }>(url)
      .pipe(map(r => r.data))
      .subscribe({
        next: animal => { this.fichaAnimal.set(animal); this.fichaLoading.set(false); },
        error: () => { this.fichaLoading.set(false); },
      });
  }

  closeFicha(): void {
    this.fichaVisible.set(false);
    this.fichaAnimal.set(null);
  }

  goToAnimal(node: PedigreeNode): void {
    if (!node.es_externo) {
      this.router.navigate(['/Animals']);
    }
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      EN_FINCA: 'En Finca',
      VENDIDO: 'Vendido',
      FALLECIDO: 'Fallecido',
      EXTERNO: 'Ref. Externa',
    };
    return map[estado] ?? estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      EN_FINCA: 'bg-emerald-100 text-emerald-700',
      VENDIDO: 'bg-blue-100 text-blue-700',
      FALLECIDO: 'bg-gray-200 text-gray-600',
      EXTERNO: 'bg-purple-100 text-purple-700',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-500';
  }

  trackByKey(_: number, n: NodeLayout): string { return n.uniqueKey; }
}
