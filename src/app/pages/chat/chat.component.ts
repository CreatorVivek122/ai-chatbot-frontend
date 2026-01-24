import { Component, HostListener, OnInit } from '@angular/core';
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
  hasGeneratedTitle?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  imports: [CommonModule, FormsModule, MarkdownModule]
})
export class ChatComponent implements OnInit {

  /* ================= SIDEBAR ================= */
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  /* ================= THEME ================= */
  isDarkMode = false;

  /* ================= STORAGE ================= */
  private readonly STORAGE_KEY = 'ang_chats_v1';
  private readonly MAX_HISTORY = 10;

  chats: ChatSession[] = [];
  activeChatId!: number;

  userInput = '';
  isLoading = false;
  isFirstInteraction = true;

  /* ================= MENUS ================= */
  isModelMenuOpen = false;
  isChatMenuOpen = false;

  /* ================= RENAME ================= */
  renamingChat = false;
  renameInput = '';

  /* ================= MODEL ================= */
  selectedModel: ModelType = 'FAST';

  models: { value: ModelType; label: string }[] = [
    { value: 'FAST', label: 'Fast' },
    { value: 'SMART', label: 'Smart' },
    { value: 'LONG', label: 'Long' },
    { value: 'LIGHT', label: 'Light' }
  ];

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.loadTheme();
    this.loadChatsFromStorage();
    if (!this.chats.length) this.createNewChat();
  }

  /* ================= THEME ================= */

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('ang-theme', this.isDarkMode ? 'dark' : 'light');
  }

  private loadTheme() {
    this.isDarkMode = localStorage.getItem('ang-theme') === 'dark';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  /* ================= GETTERS ================= */

  get activeChat() {
    return this.chats.find(c => c.id === this.activeChatId)!;
  }

  get starredChats(): ChatSession[] {
    return this.chats.filter(c => c.isStarred);
  }

  get recentChats(): ChatSession[] {
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
    this.isModelMenuOpen = false;
    this.isChatMenuOpen = false;

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
    this.isChatMenuOpen = false;
    this.saveChatsToStorage();
  }

  private generateTitle(chat: ChatSession) {
    chat.isGeneratingTitle = true;

    const titleContext = chat.messages.slice(0, 4).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    this.chatService.generateTitle(titleContext).subscribe({
      next: res => {
        chat.title = res.title || 'New Chat ';
        chat.hasGeneratedTitle = true;
        chat.isGeneratingTitle = false;
        this.saveChatsToStorage();
      }, 
      error: () => {
        chat.isGeneratingTitle = false;
      }
    });
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const chat = this.activeChat;
    const msg = this.userInput;
    this.userInput = '';

    chat.messages.push({ text: msg, sender: 'user' });
    this.isFirstInteraction = false;
    this.saveChatsToStorage();

    const conversation = chat.messages
      .slice(-this.MAX_HISTORY)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    this.isLoading = true;

    this.chatService.sendMessage(conversation, chat.model).subscribe({
      next: r => {
        chat.messages.push({ text: r.reply, sender: 'bot' });
        this.isLoading = false;

        // Generate title for the chat if it's the first interaction
        if(!chat.hasGeneratedTitle && chat.messages.length >= 4){
          this.generateTitle(chat);
        }

        this.saveChatsToStorage();
      },
      error: () => {
        chat.messages.push({ text: '⚠️ Something went wrong.', sender: 'bot' });
        this.isLoading = false;
      }
    });
  }

  /* ================= MODEL ================= */

  toggleModelMenu() {
    this.isModelMenuOpen = !this.isModelMenuOpen;
  }

  selectModel(m: ModelType) {
    this.selectedModel = m;
    this.activeChat.model = m;
    this.isModelMenuOpen = false;
    this.saveChatsToStorage();
  }

  /* ================= CHAT MENU ================= */

  toggleChatMenu() {
    this.isChatMenuOpen = !this.isChatMenuOpen;
  }

  startRename() {
    this.renameInput = this.activeChat.title;
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

  /* ================= GLOBAL CLOSE ================= */

  @HostListener('document:click', ['$event'])
  closeMenus(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.model-picker')) this.isModelMenuOpen = false;
    if (!t.closest('.chat-menu')) this.isChatMenuOpen = false;
  }
}
