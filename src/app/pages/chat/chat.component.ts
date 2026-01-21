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

  private readonly STORAGE_KEY = 'ang_chats_v1';
  private readonly MAX_HISTORY = 10;

  chats: ChatSession[] = [];
  activeChatId!: number;

  userInput = '';
  isLoading = false;
  isFirstInteraction = true;

  isChatMenuOpen = false;
  isModelMenuOpen = false;
  renamingChat = false;
  renameInput = '';
  sidebarMenuChatId: number | null = null;

  selectedModel: ModelType = 'FAST';

  models = [
    { value: 'FAST', label: '⚡ Fast' },
    { value: 'SMART', label: '🧠 Smart' },
    { value: 'LONG', label: '📜 Long' },
    { value: 'LIGHT', label: '🎯 Light' }
  ] as const;

  constructor(private chatService: ChatService) {
    this.loadChatsFromStorage();
    if (!this.chats.length) this.createNewChat();
  }

  get activeChat() {
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
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chats));
  }

  private loadChatsFromStorage() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;

    this.chats = JSON.parse(raw);
    this.activeChatId = this.chats[0]?.id;
    this.isFirstInteraction = false;
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

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const chat = this.activeChat;
    const userMsg = this.userInput;
    this.userInput = '';

    chat.messages.push({ text: userMsg, sender: 'user' });
    this.saveChatsToStorage();

    // 🔥 CONVERSATION MEMORY
    const conversation = chat.messages
      .slice(-this.MAX_HISTORY)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    this.isLoading = true;

    this.chatService.sendMessage(conversation, chat.model).subscribe({
      next: res => {
        chat.messages.push({ text: res.reply, sender: 'bot' });
        this.isLoading = false;
        this.saveChatsToStorage();
      },
      error: () => {
        chat.messages.push({
          text: '⚠️ Something went wrong.',
          sender: 'bot'
        });
        this.isLoading = false;
      }
    });
  }

  toggleStar(chat: ChatSession) {
    chat.isStarred = !chat.isStarred;
    this.saveChatsToStorage();
  }

  deleteChat(chat: ChatSession) {
    this.chats = this.chats.filter(c => c.id !== chat.id);
    if (!this.chats.length) this.createNewChat();
    else this.switchChat(this.chats[0].id);
    this.saveChatsToStorage();
  }

  startRename(chat?: ChatSession) {
    const target = chat || this.activeChat;
    this.activeChatId = target.id;
    this.renameInput = target.title;
    this.renamingChat = true;
  }

  confirmRename() {
    if (this.renameInput.trim()) {
      this.activeChat.title = this.renameInput.trim();
      this.saveChatsToStorage();
    }
    this.renamingChat = false;
  }

  toggleChatMenu() {
    this.isChatMenuOpen = !this.isChatMenuOpen;
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

  openSidebarMenu(id: number) {
    this.sidebarMenuChatId = id;
  }

  closeSidebarMenu() {
    this.sidebarMenuChatId = null;
  }

  @HostListener('document:click', ['$event'])
  closeMenus(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.chat-menu')) this.isChatMenuOpen = false;
    if (!t.closest('.model-picker')) this.isModelMenuOpen = false;
    if (!t.closest('.sidebar-menu')) this.sidebarMenuChatId = null;
  }
}
