import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

type ModelType = 'FAST' | 'SMART' | 'LONG' | 'LIGHT';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  messages: Message[] = [
    { text: 'Hello 👋 How can I help you?', sender: 'bot' }
  ];

  userInput = '';
  isLoading = false;

  // 🔽 Dropdown state
  isModelMenuOpen = false;

  selectedModel: ModelType = 'FAST';

  models: {
    value: ModelType;
    title: string;
    description: string;
  }[] = [
    {
      value: 'SMART',
      title: '🧠 Smart',
      description: 'Best for complex reasoning'
    },
    {
      value: 'FAST',
      title: '⚡ Fast',
      description: 'Best for everyday tasks'
    },
    {
      value: 'LIGHT',
      title: '🎯 Light',
      description: 'Fastest for quick answers'
    },
    {
      value: 'LONG',
      title: '📜 Long',
      description: 'Best for long context'
    }
  ];

  constructor(private chatService: ChatService) {}

  toggleModelMenu() {
    this.isModelMenuOpen = !this.isModelMenuOpen;
  }

  selectModel(model: ModelType) {
    this.selectedModel = model;
    this.isModelMenuOpen = false;
  }

  get selectedModelLabel() {
    return this.models.find(m => m.value === this.selectedModel)?.title;
  }

  // 🔒 Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.model-picker')) {
      this.isModelMenuOpen = false;
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput;
    this.userInput = '';

    this.messages.push({ text: userMessage, sender: 'user' });
    this.isLoading = true;

    this.chatService
      .sendMessage(userMessage, this.selectedModel)
      .subscribe({
        next: (res) => {
          this.messages.push({ text: res.reply, sender: 'bot' });
          this.isLoading = false;
        },
        error: () => {
          this.messages.push({
            text: '⚠️ Something went wrong. Try again.',
            sender: 'bot'
          });
          this.isLoading = false;
        }
      });
  }
}
