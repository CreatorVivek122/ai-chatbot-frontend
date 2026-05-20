import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  isFavorite: boolean;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private API_URL = 'https://ai-chatbot-backend-s8qj.vercel.app/api/chat';

  // State Signals
  chats = signal<ChatSession[]>(this.loadChats());
  activeChatId = signal<string | null>(null);
  selectedModel = signal<any>({ id: 'ang-4-0', name: 'Ang 4.0', badge: 'Pro', badgeClass: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' });

  // Computed State
  activeChat = computed(() => {
    const chats = this.chats();
    const activeId = this.activeChatId();
    return chats.find(c => c.id === activeId) || null;
  });

  constructor(private http: HttpClient) {
    // Persist to local storage whenever chats change
    effect(() => {
      localStorage.setItem('ang_chats', JSON.stringify(this.chats()));
    });
  }

  private loadChats(): ChatSession[] {
    const stored = localStorage.getItem('ang_chats');
    if (stored) {
      try {
        const parsed: ChatSession[] = JSON.parse(stored);
        // Ensure dates are parsed back to Date objects
        return parsed.map(chat => ({
          ...chat,
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  createNewChat() {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      isFavorite: false,
      updatedAt: new Date()
    };
    this.chats.update(chats => [newChat, ...chats]);
    this.activeChatId.set(newChat.id);
  }

  setActiveChat(id: string) {
    this.activeChatId.set(id);
  }

  deleteChat(id: string) {
    this.chats.update(chats => chats.filter(c => c.id !== id));
    if (this.activeChatId() === id) {
      this.activeChatId.set(null);
    }
  }

  toggleFavorite(id: string) {
    this.chats.update(chats => 
      chats.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
    );
  }

  updateChatTitle(id: string, title: string) {
    this.chats.update(chats => 
      chats.map(c => c.id === id ? { ...c, title } : c)
    );
  }

  addMessageToActiveChat(message: ChatMessage) {
    let currentId = this.activeChatId();
    
    // If no active chat, create one automatically
    if (!currentId) {
      this.createNewChat();
      currentId = this.activeChatId();
    }

    if (currentId) {
      this.chats.update(chats => 
        chats.map(c => c.id === currentId ? { 
          ...c, 
          messages: [...c.messages, message],
          updatedAt: new Date()
        } : c).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
    }
  }

  sendMessage(messages: any[], model: string) {
    return this.http.post<any>(this.API_URL, {
      messages,
      model
    });
  }

  generateTitle(message: string) {
    return this.http.post<{ title : string }>(
      'https://ai-chatbot-backend-s8qj.vercel.app/api/title',
      { message }
    );
  }
}
