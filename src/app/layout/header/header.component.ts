import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  inject,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { ChatService } from '../../core/services/chat.service';
import {
  LucideAngularModule,
  Menu,
  Moon,
  Sun,
  Type,
  Droplet,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header
      class="h-16 flex items-center justify-between px-4 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-10 glass-panel"
    >
      <div class="flex items-center gap-2 md:gap-4">
        <!-- Mobile Menu Toggle -->
        <button
          class="md:hidden p-2 -ml-2 rounded-xl hover:bg-bg-hover text-text-muted transition-colors flex items-center justify-center"
          (click)="onMenuToggle.emit()"
        >
          <lucide-icon [img]="Menu" class="w-5 h-5"></lucide-icon>
        </button>

        <!-- Model Selector Dropdown -->
        <div
          class="relative group cursor-pointer"
          (click)="toggleModelDropdown($event)"
        >
          <div
            class="flex items-center gap-2 hover:bg-bg-hover px-3 py-1.5 rounded-xl transition-colors"
          >
            <span class="font-semibold text-text-main text-lg tracking-tight">{{
              selectedModel.name
            }}</span>
            <span
              *ngIf="selectedModel.badge"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              [ngClass]="selectedModel.badgeClass"
              >{{ selectedModel.badge }}</span
            >
            <lucide-icon
              [img]="ChevronDown"
              class="w-4 h-4 text-text-muted transition-transform duration-200"
              [class.rotate-180]="isModelDropdownOpen"
            ></lucide-icon>
          </div>

          <!-- Dropdown Menu -->
          <div
            *ngIf="isModelDropdownOpen"
            class="absolute top-full left-0 mt-2 w-56 bg-bg-surface border border-border-subtle rounded-2xl shadow-elevated py-2 z-50 animate-[fade-in_0.15s_ease-out]"
          >
            <div class="px-3 pb-2 mb-2 border-b border-border-subtle">
              <div
                class="text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                Models
              </div>
            </div>
            <div class="space-y-1 px-1">
              @for (model of availableModels; track model.id) {
                <button
                  class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-bg-hover transition-colors"
                  (click)="selectModel(model)"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-text-main">{{
                      model.name
                    }}</span>
                    <span
                      *ngIf="model.badge"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase"
                      [ngClass]="model.badgeClass"
                      >{{ model.badge }}</span
                    >
                  </div>
                  <lucide-icon
                    *ngIf="selectedModel.id === model.id"
                    [img]="Check"
                    class="w-4 h-4 text-accent-primary"
                  ></lucide-icon>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 md:gap-2">
        <!-- Visual Style Selector -->
        <div
          class="hidden sm:flex bg-bg-elevated p-1 rounded-xl border border-border-subtle items-center"
        >
          <button
            class="p-1.5 rounded-lg transition-all flex items-center justify-center"
            [class.bg-bg-surface]="themeService.visualStyle() === 'default'"
            [class.shadow-sm]="themeService.visualStyle() === 'default'"
            [class.text-text-main]="themeService.visualStyle() === 'default'"
            [class.text-text-muted]="themeService.visualStyle() !== 'default'"
            (click)="themeService.setVisualStyle('default')"
            title="Default"
          >
            <lucide-icon [img]="Type" class="w-4 h-4"></lucide-icon>
          </button>
          <button
            class="p-1.5 rounded-lg transition-all flex items-center justify-center"
            [class.bg-bg-surface]="themeService.visualStyle() === 'glass'"
            [class.shadow-sm]="themeService.visualStyle() === 'glass'"
            [class.text-text-main]="themeService.visualStyle() === 'glass'"
            [class.text-text-muted]="themeService.visualStyle() !== 'glass'"
            (click)="themeService.setVisualStyle('glass')"
            title="Glassmorphism"
          >
            <lucide-icon [img]="Droplet" class="w-4 h-4"></lucide-icon>
          </button>
          <button
            class="p-1.5 rounded-lg transition-all flex items-center justify-center"
            [class.bg-bg-surface]="themeService.visualStyle() === 'neumorphism'"
            [class.shadow-sm]="themeService.visualStyle() === 'neumorphism'"
            [class.text-text-main]="
              themeService.visualStyle() === 'neumorphism'
            "
            [class.text-text-muted]="
              themeService.visualStyle() !== 'neumorphism'
            "
            (click)="themeService.setVisualStyle('neumorphism')"
            title="Neumorphism"
          >
            <lucide-icon [img]="Layers" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <!-- Theme Toggle -->
        <button
          class="p-2.5 rounded-xl hover:bg-bg-hover text-text-muted hover:text-text-main transition-colors flex items-center justify-center"
          (click)="themeService.toggleThemeMode()"
        >
          <lucide-icon
            [img]="themeService.themeMode() === 'dark' ? Sun : Moon"
            class="w-5 h-5"
          ></lucide-icon>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Output() onMenuToggle = new EventEmitter<void>();
  themeService = inject(ThemeService);
  chatService = inject(ChatService);
  elementRef = inject(ElementRef);

  Menu = Menu;
  Moon = Moon;
  Sun = Sun;
  Type = Type;
  Droplet = Droplet;
  Layers = Layers;
  ChevronDown = ChevronDown;
  Check = Check;

  isModelDropdownOpen = false;

  availableModels = [
    {
      id: 'FAST',
      name: 'Ang 3.5',
      badge: 'Fast',
      badgeClass:
        'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    },
    {
      id: 'SMART',
      name: 'Ang 4.0',
      badge: 'Pro',
      badgeClass:
        'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
    },
    {
      id: 'LONG',
      name: 'Ang o1',
      badge: 'Preview',
      badgeClass:
        'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    },
  ];

  get selectedModel() {
    return this.chatService.selectedModel();
  }

  toggleModelDropdown(event: Event) {
    event.stopPropagation();
    this.isModelDropdownOpen = !this.isModelDropdownOpen;
  }

  selectModel(model: any) {
    this.chatService.selectedModel.set(model);
    this.isModelDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isModelDropdownOpen = false;
    }
  }
}
