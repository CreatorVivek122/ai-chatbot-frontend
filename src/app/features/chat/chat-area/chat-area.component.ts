import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import {
  LucideAngularModule,
  Bot,
  Sparkles,
  Code,
  FileText,
  Lightbulb,
} from 'lucide-angular';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [
    CommonModule,
    ChatMessageComponent,
    MessageComposerComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="flex flex-col h-full relative">
      <!-- Scrollable Message Area -->
      <div
        class="flex-1 overflow-y-auto px-4 py-6 scroll-smooth scrollbar-hide"
        #scrollContainer
      >
        <div
          class="max-w-4xl mx-auto w-full flex flex-col justify-end min-h-full"
        >
          <!-- Empty State -->
          <div
            *ngIf="messages().length === 0"
            class="flex flex-col items-center justify-center my-auto animate-[fade-in_0.6s_ease-out]"
          >
            <div
              class="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-highlight flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.3)] dark:shadow-[0_0_60px_rgba(99,102,241,0.2)] neumorph-panel"
            >
              <lucide-icon
                [img]="Bot"
                class="text-white w-10 h-10"
              ></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-text-main mb-2 tracking-tight">
              How can I assist you today?
            </h2>
            <p class="text-text-muted mb-12 text-center max-w-md">
              I can help you write code, brainstorm ideas, draft emails, and
              more.
            </p>

            <!-- Suggested Prompts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              @for (prompt of suggestedPrompts; track prompt.title) {
                <button
                  class="p-4 rounded-2xl border border-border-subtle bg-bg-surface hover:bg-bg-hover text-left transition-all hover:shadow-md group flex flex-col gap-2 neumorph-pressed glass-panel"
                  (click)="onSend(prompt.text)"
                >
                  <div
                    class="flex items-center gap-2 text-text-main font-semibold"
                  >
                    <lucide-icon
                      [img]="prompt.icon"
                      class="w-4 h-4 text-accent-primary"
                    ></lucide-icon>
                    {{ prompt.title }}
                  </div>
                  <div class="text-sm text-text-muted line-clamp-2">
                    {{ prompt.text }}
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Messages List -->
          <div class="flex flex-col gap-2 w-full pb-8">
            @for (msg of messages(); track msg.id) {
              <app-chat-message [message]="msg"></app-chat-message>
            }

            <!-- Typing Indicator -->
            <div
              *ngIf="isGenerating"
              class="flex w-full py-6 animate-[fade-in_0.3s_ease-out]"
            >
              <div class="flex gap-4 max-w-[85%] md:max-w-[75%]">
                <div class="shrink-0 pt-1">
                  <div
                    class="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-md"
                  >
                    <lucide-icon
                      [img]="Bot"
                      class="text-white w-5 h-5"
                    ></lucide-icon>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <div
                    class="px-5 py-4 rounded-3xl relative bg-bg-surface border border-border-subtle rounded-tl-sm shadow-sm neumorph-panel glass-panel flex items-center gap-1.5 min-h-[48px]"
                  >
                    <div
                      class="w-2 h-2 rounded-full bg-text-muted animate-typing-dot"
                      style="animation-delay: 0ms"
                    ></div>
                    <div
                      class="w-2 h-2 rounded-full bg-text-muted animate-typing-dot"
                      style="animation-delay: 200ms"
                    ></div>
                    <div
                      class="w-2 h-2 rounded-full bg-text-muted animate-typing-dot"
                      style="animation-delay: 400ms"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Composer Container -->
      <div
        class="w-full bg-gradient-to-t from-bg-main via-bg-main/90 to-transparent pt-6 pb-2 px-4 z-10 shrink-0"
      >
        <app-message-composer
          (onSend)="onSend($event)"
          [isGenerating]="isGenerating"
        ></app-message-composer>
      </div>
    </div>
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
export class ChatAreaComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  chatService = inject(ChatService);

  Bot = Bot;
  Sparkles = Sparkles;
  Code = Code;
  FileText = FileText;
  Lightbulb = Lightbulb;

  isGenerating = false;
  shouldScroll = false;

  suggestedPrompts = [
    {
      title: 'Write code',
      text: 'Write a Python script to automate renaming files in a directory based on their creation date.',
      icon: Code,
    },
    {
      title: 'Brainstorm ideas',
      text: 'Give me 5 unique ideas for a hackathon project using Angular and AI.',
      icon: Lightbulb,
    },
    {
      title: 'Draft an email',
      text: 'Draft a professional email to my manager asking for an update on the promotion timeline.',
      icon: FileText,
    },
    {
      title: 'Explain a concept',
      text: 'Explain how quantum computing works to a high school student.',
      icon: Sparkles,
    },
  ];

  messages() {
    return this.chatService.activeChat()?.messages || [];
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  onSend(content: string) {
    if (!content.trim() || this.isGenerating) return;

    // Save user message to active chat
    this.chatService.addMessageToActiveChat({
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    });

    this.shouldScroll = true;
    this.isGenerating = true;

    // Call actual API
    const updatedActiveChat = this.chatService.activeChat();
    if (!updatedActiveChat) {
      this.isGenerating = false;
      return;
    }

    const conversation = updatedActiveChat.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const selectedModel = this.chatService.selectedModel().id;

    this.chatService.sendMessage(conversation, selectedModel).subscribe({
      next: (r) => {
        this.isGenerating = false;
        this.chatService.addMessageToActiveChat({
          id: Date.now().toString(),
          role: 'assistant',
          content: r.reply || 'No response',
          timestamp: new Date(),
        });

        // Auto-generate title on first message using API
        if (updatedActiveChat.title === 'New Chat') {
          this.chatService.generateTitle(content).subscribe({
            next: (res) => {
              this.chatService.updateChatTitle(
                updatedActiveChat.id,
                res.title || 'New Chat',
              );
            },
            error: () => {
              const fallbackTitle =
                content.trim().slice(0, 25) +
                (content.length > 25 ? '...' : '');
              this.chatService.updateChatTitle(
                updatedActiveChat.id,
                fallbackTitle,
              );
            },
          });
        }

        this.shouldScroll = true;
      },
      error: () => {
        this.isGenerating = false;
        this.chatService.addMessageToActiveChat({
          id: Date.now().toString(),
          role: 'assistant',
          content:
            '⚠️ Something went wrong. Please check your connection and try again.',
          timestamp: new Date(),
        });

        // Fallback title generation if API fails on first message
        if (updatedActiveChat.title === 'New Chat') {
          const fallbackTitle =
            content.trim().slice(0, 25) + (content.length > 25 ? '...' : '');
          this.chatService.updateChatTitle(updatedActiveChat.id, fallbackTitle);
        }

        this.shouldScroll = true;
      },
    });
  }
}
