import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';

/* =========================
   TYPES
========================= */
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
}

/* =========================
   COMPONENT
========================= */
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

  selectedModel: ModelType = 'FAST';
  isModelMenuOpen = false;

  models: ReadonlyArray<{
    value: ModelType;
    label: string;
  }> = [
    { value: 'FAST', label: '⚡ Fast' },
    { value: 'SMART', label: '🧠 Smart' },
    { value: 'LONG', label: '📜 Long' },
    { value: 'LIGHT', label: '🎯 Light' }
  ];

  constructor(private chatService: ChatService) {
    this.createNewChat();
  }

  /* =========================
     CHAT MANAGEMENT
  ========================= */
  createNewChat() {
    const chat: ChatSession = {
      id: Date.now(),
      title: 'New Chat',
      model: this.selectedModel,
      messages: [
        { text: 'Hello 👋 How can I help you?', sender: 'bot' }
      ]
    };

    this.chats.unshift(chat);
    this.activeChatId = chat.id;
  }

  switchChat(id: number) {
    this.activeChatId = id;

    // ✅ Sync dropdown with this chat's model
    const chat = this.chats.find(c => c.id === id);
    if (chat) {
      this.selectedModel = chat.model;
    }
  }

  get activeChat(): ChatSession {
    return this.chats.find(c => c.id === this.activeChatId)!;
  }

  /* =========================
     MODEL PICKER
  ========================= */
  toggleModelMenu() {
    this.isModelMenuOpen = !this.isModelMenuOpen;
  }

  selectModel(model: ModelType) {
    this.selectedModel = model;
    this.activeChat.model = model;
    this.isModelMenuOpen = false;
  }

  get selectedModelLabel(): string {
    return this.models.find(m => m.value === this.selectedModel)?.label ?? '';
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.model-picker')) {
      this.isModelMenuOpen = false;
    }
  }

  /* =========================
     SEND MESSAGE
  ========================= */
  sendMessage() {
  if (!this.userInput.trim() || this.isLoading) return;

  const chat = this.activeChat;
  const message = this.userInput;
  this.userInput = '';

  chat.messages.push({ text: message, sender: 'user' });

  // 🔹 Temporary title
  if (chat.title === 'New Chat') {
    chat.title = 'Generating title...';

    this.chatService.generateTitle(message).subscribe({
      next: (res) => {
        chat.title = res.title || 'New Chat';
      },
      error: () => {
        chat.title = message.slice(0, 30);
      }
    });
  }

  this.isLoading = true;

  this.chatService.sendMessage(message, chat.model).subscribe({
    next: (res) => {
      chat.messages.push({
        text: res.reply,
        sender: 'bot'
      });
      this.isLoading = false;
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

}
