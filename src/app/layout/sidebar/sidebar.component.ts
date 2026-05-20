import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatSession } from '../../core/services/chat.service';
import {
  LucideAngularModule,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <aside
      [class]="isCollapsed ? 'w-[72px]' : 'w-[280px]'"
      class="h-full flex flex-col bg-bg-surface border-r border-border-subtle transition-all duration-300 relative z-20 neumorph-panel glass-panel"
    >
      <!-- Header / Logo -->
      <div
        class="h-16 flex items-center justify-between px-4 border-b border-border-subtle shrink-0"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shrink-0 shadow-lg shadow-accent-primary/20"
          >
            <lucide-icon [img]="Bot" class="text-white w-5 h-5"></lucide-icon>
          </div>
          <span
            class="font-bold text-lg text-text-main tracking-tight whitespace-nowrap transition-opacity duration-300"
            [class.opacity-0]="isCollapsed"
            [class.w-0]="isCollapsed"
            >Ang</span
          >
        </div>

        <button
          class="md:hidden p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-colors"
          (click)="onToggle.emit()"
        >
          <lucide-icon [img]="ChevronLeft" class="w-5 h-5"></lucide-icon>
        </button>
      </div>

      <!-- New Chat Button -->
      <div class="p-4 shrink-0">
        <button
          class="w-full flex items-center justify-center gap-2 bg-text-main text-bg-main hover:opacity-90 py-3 px-4 rounded-2xl font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg overflow-hidden group"
          (click)="newChat()"
        >
          <lucide-icon
            [img]="Plus"
            class="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90"
          ></lucide-icon>
          <span
            class="whitespace-nowrap transition-opacity duration-300"
            [class.opacity-0]="isCollapsed"
            [class.hidden]="isCollapsed"
            >New Chat</span
          >
        </button>
      </div>

      <!-- Search (Hidden when collapsed) -->
      <div
        class="px-4 mb-4 transition-all duration-300 shrink-0"
        [class.opacity-0]="isCollapsed"
        [class.hidden]="isCollapsed"
      >
        <div class="relative group">
          <lucide-icon
            [img]="Search"
            class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search chats..."
            [(ngModel)]="searchQuery"
            class="w-full bg-bg-main border border-border-subtle text-text-main text-sm rounded-xl pl-12 pr-8 py-2 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
          />
          <button
            *ngIf="searchQuery"
            (click)="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-1"
          >
            <lucide-icon [img]="X" class="w-3 h-3"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Chat Lists -->
      <div class="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        <!-- Favorites -->
        <ng-container *ngIf="favoriteChats().length > 0">
          <div
            class="px-2 mb-2 mt-2 text-xs font-semibold text-text-muted uppercase tracking-wider transition-opacity duration-300"
            [class.opacity-0]="isCollapsed"
            [class.hidden]="isCollapsed"
          >
            Favorites
          </div>

          <div class="space-y-1 mb-4">
            @for (chat of favoriteChats(); track chat.id) {
              <ng-container
                *ngTemplateOutlet="chatItem; context: { chat: chat }"
              ></ng-container>
            }
          </div>
        </ng-container>

        <!-- Recents -->
        <ng-container *ngIf="recentChats().length > 0">
          <div
            class="px-2 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider transition-opacity duration-300"
            [class.opacity-0]="isCollapsed"
            [class.hidden]="isCollapsed"
          >
            Recent
          </div>

          <div class="space-y-1">
            @for (chat of recentChats(); track chat.id) {
              <ng-container
                *ngTemplateOutlet="chatItem; context: { chat: chat }"
              ></ng-container>
            }
          </div>
        </ng-container>

        <!-- Empty State for Search -->
        <div
          *ngIf="
            searchQuery &&
            favoriteChats().length === 0 &&
            recentChats().length === 0
          "
          class="text-center py-6 text-sm text-text-muted"
          [class.hidden]="isCollapsed"
        >
          No chats found.
        </div>
      </div>

      <!-- User Profile / Settings -->
      <div
        class="p-4 border-t border-border-subtle flex items-center justify-between shrink-0"
      >
        <div
          class="flex items-center gap-3 overflow-hidden cursor-pointer group w-full p-2 -m-2 rounded-xl hover:bg-bg-main transition-colors"
        >
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-highlight to-accent-secondary shrink-0 border-2 border-bg-surface flex items-center justify-center text-white text-xs font-bold"
          >
            VR
          </div>
          <div
            class="flex-1 min-w-0 transition-all duration-300"
            [class.opacity-0]="isCollapsed"
            [class.hidden]="isCollapsed"
          >
            <div class="text-sm font-semibold text-text-main truncate">
              Vivek Redekar
            </div>
            <div class="text-xs text-text-muted truncate">Pro Plan</div>
          </div>
          <lucide-icon
            [img]="Settings"
            class="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            [class.hidden]="isCollapsed"
          ></lucide-icon>
        </div>
      </div>

      <!-- Desktop Collapse Toggle -->
      <button
        class="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-surface border border-border-subtle rounded-full items-center justify-center text-text-muted hover:text-text-main hover:border-accent-primary transition-colors shadow-sm z-30"
        (click)="onToggle.emit()"
      >
        <lucide-icon
          [img]="isCollapsed ? ChevronRight : ChevronLeft"
          class="w-3 h-3"
        ></lucide-icon>
      </button>
    </aside>

    <!-- Chat Item Template -->
    <ng-template #chatItem let-chat="chat">
      <div
        class="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-main transition-colors group cursor-pointer neumorph-pressed"
        [class.bg-bg-elevated]="chatService.activeChatId() === chat.id"
        (click)="selectChat(chat.id)"
      >
        <lucide-icon
          [img]="MessageSquare"
          class="w-4 h-4 shrink-0 text-text-muted"
          [class.text-accent-primary]="chatService.activeChatId() === chat.id"
        ></lucide-icon>

        <!-- Title or Rename Input -->
        <div
          class="flex-1 text-left truncate text-sm transition-all duration-300 overflow-hidden"
          [class.opacity-0]="isCollapsed"
          [class.hidden]="isCollapsed"
        >
          <ng-container *ngIf="editingChatId !== chat.id; else editMode">
            <span
              class="text-text-secondary group-hover:text-text-main transition-colors"
              [class.font-medium]="chatService.activeChatId() === chat.id"
              [class.text-text-main]="chatService.activeChatId() === chat.id"
            >
              {{ chat.title }}
            </span>
          </ng-container>
          <ng-template #editMode>
            <input
              type="text"
              [(ngModel)]="editTitleValue"
              (click)="$event.stopPropagation()"
              (keydown.enter)="saveRename(chat)"
              (keydown.escape)="cancelRename()"
              (blur)="saveRename(chat)"
              class="w-full bg-bg-surface border border-accent-primary text-text-main text-xs rounded px-1.5 py-0.5 outline-none -ml-1.5 focus:ring-1 focus:ring-accent-primary/50"
              autofocus
            />
          </ng-template>
        </div>

        <!-- Star Icon (Persistent if favored, hidden if collapsed) -->
        <lucide-icon
          *ngIf="chat.isFavorite && !isCollapsed"
          [img]="Star"
          class="w-3.5 h-3.5 shrink-0 text-yellow-500 absolute right-8 group-hover:hidden"
        ></lucide-icon>

        <!-- Actions Dropdown Trigger -->
        <button
          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-elevated rounded-md transition-all absolute right-2 text-text-muted hover:text-text-main"
          [class.hidden]="isCollapsed || editingChatId === chat.id"
          (click)="toggleActionsMenu($event, chat.id)"
        >
          <lucide-icon [img]="MoreHorizontal" class="w-4 h-4"></lucide-icon>
        </button>

        <!-- Action Menu -->
        <div
          *ngIf="activeMenuId === chat.id && !isCollapsed"
          class="absolute right-2 top-10 w-36 bg-bg-surface border border-border-subtle rounded-xl shadow-elevated py-1.5 z-50 animate-[fade-in_0.15s_ease-out]"
        >
          <button
            class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-main hover:bg-bg-hover transition-colors"
            (click)="startRename(chat, $event)"
          >
            <lucide-icon
              [img]="Edit2"
              class="w-3.5 h-3.5 text-text-muted"
            ></lucide-icon>
            Rename
          </button>
          <button
            class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-main hover:bg-bg-hover transition-colors"
            (click)="toggleFavorite(chat.id, $event)"
          >
            <lucide-icon
              [img]="Star"
              class="w-3.5 h-3.5 text-text-muted"
              [class.text-yellow-500]="chat.isFavorite"
            ></lucide-icon>
            {{ chat.isFavorite ? 'Unfavorite' : 'Favorite' }}
          </button>
          <div class="h-px w-full bg-border-subtle my-1"></div>
          <button
            class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
            (click)="deleteChat(chat.id, $event)"
          >
            <lucide-icon [img]="Trash2" class="w-3.5 h-3.5"></lucide-icon>
            Delete
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() onToggle = new EventEmitter<void>();

  chatService = inject(ChatService);
  elementRef = inject(ElementRef);

  searchQuery = '';
  activeMenuId: string | null = null;

  editingChatId: string | null = null;
  editTitleValue = '';

  Bot = Bot;
  Plus = Plus;
  Search = Search;
  MessageSquare = MessageSquare;
  MoreHorizontal = MoreHorizontal;
  Settings = Settings;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  Star = Star;
  Trash2 = Trash2;
  Edit2 = Edit2;
  Check = Check;
  X = X;

  // Computed properties for filtering
  filteredChats = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const chats = this.chatService.chats();
    if (!query) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(query));
  });

  favoriteChats = computed(() =>
    this.filteredChats().filter((c) => c.isFavorite),
  );
  recentChats = computed(() =>
    this.filteredChats().filter((c) => !c.isFavorite),
  );

  newChat() {
    this.chatService.createNewChat();
  }

  selectChat(id: string) {
    if (this.editingChatId === id) return;
    this.chatService.setActiveChat(id);
    this.activeMenuId = null;
  }

  toggleActionsMenu(event: Event, id: string) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  startRename(chat: ChatSession, event: Event) {
    event.stopPropagation();
    this.editingChatId = chat.id;
    this.editTitleValue = chat.title;
    this.activeMenuId = null;
  }

  saveRename(chat: ChatSession) {
    if (this.editTitleValue.trim() && this.editTitleValue !== chat.title) {
      this.chatService.updateChatTitle(chat.id, this.editTitleValue.trim());
    }
    this.editingChatId = null;
  }

  cancelRename() {
    this.editingChatId = null;
  }

  toggleFavorite(id: string, event: Event) {
    event.stopPropagation();
    this.chatService.toggleFavorite(id);
    this.activeMenuId = null;
  }

  deleteChat(id: string, event: Event) {
    event.stopPropagation();
    this.chatService.deleteChat(id);
    this.activeMenuId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.activeMenuId) {
      this.activeMenuId = null;
    }
  }
}
