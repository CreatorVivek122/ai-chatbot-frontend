import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';

type ModelType = 'FAST' | 'SMART' | 'LONG' | 'LIGHT';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatSession {
  id: number;
  title: string;
  model: ModelType;
  messages: Message[];
  isStarred: boolean;
  isGeneratingTitle?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  /* ================= STORAGE ================= */
  private readonly STORAGE_KEY = 'ang_chats_v1';

  /* ================= STATE ================= */
  chats: ChatSession[] = [];
  activeChatId!: number;

  userInput = '';
  isLoading = false;
  isFirstInteraction = true;

  /* Navbar */
  isChatMenuOpen = false;
  renamingChat = false;
  renameInput = '';

  /* Sidebar menu */
  sidebarMenuChatId: number | null = null;

  /* Model picker */
  selectedModel: ModelType = 'FAST';
  isModelMenuOpen = false;

  models = [
    { value: 'FAST', label: '⚡ Fast' },
    { value: 'SMART', label: '🧠 Smart' },
    { value: 'LONG', label: '📜 Long' },
    { value: 'LIGHT', label: '🎯 Light' }
  ] as const;

  constructor(private chatService: ChatService) {
    this.loadChatsFromStorage();

    if (!this.chats.length) {
      this.createNewChat();
    }
  }

  /* ================= GETTERS ================= */

  get activeChat(): ChatSession {
    return this.chats.find(c => c.id === this.activeChatId)!;
  }

  get starredChats() {
    return this.chats.filter(c => c.isStarred);
  }

  get recentChats() {
    return this.chats.filter(c => !c.isStarred);
  }

  /* ================= STORAGE ================= */

  private saveChatsToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chats));
    } catch (err) {
      console.error('Failed to save chats', err);
    }
  }

  private loadChatsFromStorage() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        this.chats = parsed;
        this.activeChatId = this.chats[0]?.id;
        this.isFirstInteraction = false;
      }
    } catch (err) {
      console.error('Failed to load chats', err);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /* ================= CHAT ================= */

  createNewChat() {
    const chat: ChatSession = {
      id: Date.now(),
      title: 'New Chat',
      model: this.selectedModel,
      isStarred: false,
      messages: [{ text: 'Hello 👋 How can I help you?', sender: 'bot' }]
    };

    this.chats.unshift(chat);
    this.activeChatId = chat.id;
    this.selectedModel = chat.model;
    this.isFirstInteraction = true;

    this.saveChatsToStorage();
  }

  switchChat(id: number) {
    this.activeChatId = id;
    this.selectedModel = this.activeChat.model;
    this.isFirstInteraction = false;
    this.closeSidebarMenu();

    this.saveChatsToStorage();
  }

  toggleStar(chat: ChatSession) {
    chat.isStarred = !chat.isStarred;
    this.saveChatsToStorage();
  }

  deleteChat(chat: ChatSession) {
    this.chats = this.chats.filter(c => c.id !== chat.id);

    if (this.chats.length) {
      this.switchChat(this.chats[0].id);
    } else {
      this.createNewChat();
    }

    this.saveChatsToStorage();
  }

  /* ================= RENAME ================= */

  startRename(chat?: ChatSession) {
    const target = chat || this.activeChat;
    this.activeChatId = target.id;
    this.renameInput = target.title;
    this.renamingChat = true;
    this.isChatMenuOpen = false;
  }

  confirmRename() {
    if (this.renameInput.trim()) {
      this.activeChat.title = this.renameInput.trim();
      this.saveChatsToStorage();
    }
    this.renamingChat = false;
  }

  /* ================= MESSAGE ================= */

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    if (this.isFirstInteraction) this.isFirstInteraction = false;

    const chat = this.activeChat;
    const msg = this.userInput;
    this.userInput = '';

    chat.messages.push({ text: msg, sender: 'user' });
    this.saveChatsToStorage();

    if (chat.title === 'New Chat') {
      chat.isGeneratingTitle = true;

      this.chatService.generateTitle(msg).subscribe({
        next: r => {
          chat.title = r.title || 'New Chat';
          chat.isGeneratingTitle = false;
          this.saveChatsToStorage();
        },
        error: () => {
          chat.title = msg.slice(0, 30);
          chat.isGeneratingTitle = false;
          this.saveChatsToStorage();
        }
      });
    }

    this.isLoading = true;

    this.chatService.sendMessage(msg, chat.model).subscribe({
      next: r => {
        chat.messages.push({ text: r.reply, sender: 'bot' });
        this.isLoading = false;
        this.saveChatsToStorage();
      },
      error: () => {
        chat.messages.push({
          text: '⚠️ Something went wrong.',
          sender: 'bot'
        });
        this.isLoading = false;
        this.saveChatsToStorage();
      }
    });
  }

  /* ================= MENUS ================= */

  toggleChatMenu() {
    this.isChatMenuOpen = !this.isChatMenuOpen;
  }

  openSidebarMenu(chatId: number) {
    this.sidebarMenuChatId = chatId;
  }

  closeSidebarMenu() {
    this.sidebarMenuChatId = null;
  }

  toggleModelMenu() {
    this.isModelMenuOpen = !this.isModelMenuOpen;
  }

  selectModel(m: ModelType) {
    this.selectedModel = m;
    this.activeChat.model = m;
    this.isModelMenuOpen = false;
    this.saveChatsToStorage();
  }

  /* ================= GLOBAL CLOSE ================= */

  @HostListener('document:click', ['$event'])
  closeMenus(e: MouseEvent) {
    const t = e.target as HTMLElement;

    if (!t.closest('.chat-menu')) this.isChatMenuOpen = false;
    if (!t.closest('.model-picker')) this.isModelMenuOpen = false;
    if (!t.closest('.sidebar-menu')) this.sidebarMenuChatId = null;
  }
}
