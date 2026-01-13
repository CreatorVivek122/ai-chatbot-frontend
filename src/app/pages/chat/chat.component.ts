import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule   
  ],
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  messages: Message[] = [
    { text: 'Hello 👋 How can I help you?', sender: 'bot' }
  ];

  userInput = '';
  isLoading = false;

  constructor(private chatService: ChatService) {}

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput;
    this.userInput = '';

    this.messages.push({ text: userMessage, sender: 'user' });
    this.isLoading = true;

    this.chatService.sendMessage(userMessage).subscribe({
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
