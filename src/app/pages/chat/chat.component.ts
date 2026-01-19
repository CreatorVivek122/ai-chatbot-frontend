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

  chats: ChatSession[] = [];
  activeChatId!: number;

  userInput = '';
  isLoading = false;
  isFirstInteraction = true;

  // Navbar / menus
  isChatMenuOpen = false;
  renamingChat = false;
  renameInput = '';

  // Model picker
  selectedModel: ModelType = 'FAST';
  isModelMenuOpen = false;

  models: ReadonlyArray<{ value: ModelType; label: string }> = [
    { value: 'FAST', label: '⚡ Fast' },
    { value: 'SMART', label: '🧠 Smart' },
    { value: 'LONG', label: '📜 Long' },
    { value: 'LIGHT', label: '🎯 Light' }
  ];

  constructor(private chatService: ChatService) {
    this.createNewChat();
  }

  /* ================= CHAT GETTERS ================= */

  get activeChat(): ChatSession {
    return this.chats.find(c => c.id === this.activeChatId)!;
  }

  get starredChats() {
    return this.chats.filter(c => c.isStarred);
  }

  get recentChats() {
    return this.chats.filter(c => !c.isStarred);
  }

  /* ================= CHAT ACTIONS ================= */

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
  }

  switchChat(id: number) {
    this.activeChatId = id;
    this.selectedModel = this.activeChat.model;
    this.isFirstInteraction = false;
    this.isChatMenuOpen = false;
  }

  toggleStar(chat: ChatSession) {
    chat.isStarred = !chat.isStarred;
  }

  deleteChat(chat: ChatSession) {
    this.chats = this.chats.filter(c => c.id !== chat.id);
    if (this.activeChatId === chat.id && this.chats.length) {
      this.switchChat(this.chats[0].id);
    }
  }

  /* ================= RENAME ================= */

  startRename() {
    this.renameInput = this.activeChat.title;
    this.renamingChat = true;
    this.isChatMenuOpen = false;
  }

  confirmRename() {
    if (this.renameInput.trim()) {
      this.activeChat.title = this.renameInput.trim();
    }
    this.renamingChat = false;
  }

  /* ================= MESSAGE ================= */

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    if (this.isFirstInteraction) this.isFirstInteraction = false;

    const chat = this.activeChat;
    const message = this.userInput;
    this.userInput = '';

    chat.messages.push({ text: message, sender: 'user' });

    // AI title generation (only once)
    if (chat.title === 'New Chat') {
      chat.isGeneratingTitle = true;

      this.chatService.generateTitle(message).subscribe({
        next: r => {
          chat.title = r.title || 'New Chat';
          chat.isGeneratingTitle = false;
        },
        error: () => {
          chat.title = message.slice(0, 30);
          chat.isGeneratingTitle = false;
        }
      });
    }

    this.isLoading = true;

    this.chatService.sendMessage(message, chat.model).subscribe({
      next: r => {
        chat.messages.push({ text: r.reply, sender: 'bot' });
        this.isLoading = false;
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

  selectModel(model: ModelType) {
    this.selectedModel = model;
    this.activeChat.model = model;
    this.isModelMenuOpen = false;
  }

  /* ================= UI HELPERS ================= */

  toggleChatMenu() {
    this.isChatMenuOpen = !this.isChatMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenus(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.chat-menu')) this.isChatMenuOpen = false;
    if (!t.closest('.model-picker')) this.isModelMenuOpen = false;
  }
}
