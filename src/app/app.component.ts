import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { ChatAreaComponent } from './features/chat/chat-area/chat-area.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ChatAreaComponent],
  template: `
    <div class="h-screen w-screen flex bg-bg-main overflow-hidden text-text-main font-sans selection:bg-accent-primary/30">
      
      <!-- Mobile Overlay -->
      <div *ngIf="!isSidebarCollapsed && isMobile" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden animate-[fade-in_0.3s_ease-out]"
           (click)="isSidebarCollapsed = true"></div>

      <!-- Sidebar -->
      <div [class.absolute]="isMobile" 
           [class.translate-x-0]="!isSidebarCollapsed || !isMobile"
           [class.-translate-x-full]="isSidebarCollapsed && isMobile"
           class="h-full z-30 transition-transform duration-300 shadow-2xl md:shadow-none">
        <app-sidebar [isCollapsed]="isSidebarCollapsed && !isMobile" 
                     (onToggle)="isSidebarCollapsed = !isSidebarCollapsed"></app-sidebar>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-full relative">
        <app-header (onMenuToggle)="isSidebarCollapsed = !isSidebarCollapsed"></app-header>
        <main class="flex-1 relative overflow-hidden">
          <app-chat-area></app-chat-area>
        </main>
      </div>

    </div>
  `
})
export class AppComponent {
  title = 'Ang';
  isSidebarCollapsed = false;
  isMobile = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }
}
