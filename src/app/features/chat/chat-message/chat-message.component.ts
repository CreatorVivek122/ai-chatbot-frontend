import { Component, Input, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { LucideAngularModule, Bot, User, Copy, Check } from 'lucide-angular';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, MarkdownModule, LucideAngularModule],
  template: `
    <div class="flex w-full py-6 animate-[slide-up_0.4s_ease-out] group" [class.justify-end]="message.role === 'user'">
      
      <!-- Container -->
      <div class="flex gap-4 max-w-[85%] md:max-w-[75%]" [class.flex-row-reverse]="message.role === 'user'">
        
        <!-- Avatar -->
        <div class="shrink-0 pt-1" *ngIf="message.role === 'assistant'">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-md">
            <lucide-icon [img]="Bot" class="text-white w-5 h-5"></lucide-icon>
          </div>
        </div>

        <!-- Bubble -->
        <div class="flex flex-col gap-1.5 w-full" [class.items-end]="message.role === 'user'">
          <div class="px-5 py-4 rounded-3xl relative"
               [ngClass]="{
                 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-tr-sm shadow-md': message.role === 'user',
                 'bg-bg-surface border border-border-subtle rounded-tl-sm shadow-sm neumorph-panel glass-panel text-text-main': message.role === 'assistant'
               }">
            
            <ng-container *ngIf="message.role === 'user'">
              <div class="text-[15px] leading-relaxed whitespace-pre-wrap">{{ message.content }}</div>
            </ng-container>

            <ng-container *ngIf="message.role === 'assistant'">
              <markdown [data]="message.content" class="markdown-body" (ready)="onMarkdownReady()"></markdown>
            </ng-container>

          </div>
          
          <span class="text-[11px] text-text-muted font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            {{ message.timestamp | date:'shortTime' }}
          </span>
        </div>

      </div>
    </div>
  `
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;
  private el = inject(ElementRef);

  Bot = Bot;
  User = User;
  Copy = Copy;
  Check = Check;

  onMarkdownReady() {
    // Add copy buttons to code blocks
    const preElements = this.el.nativeElement.querySelectorAll('.markdown-body pre');
    preElements.forEach((pre: HTMLElement) => {
      // Prevent duplicate buttons if markdown re-renders
      if (pre.querySelector('.copy-code-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-code-btn absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-black/40 dark:hover:bg-black/60 text-text-main/70 hover:text-text-main transition-colors flex items-center justify-center opacity-0 group-hover/pre:opacity-100 backdrop-blur-md border border-white/10 dark:border-white/5';
      btn.title = 'Copy Code';
      
      const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
      const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green-500"><path d="M20 6 9 17l-5-5"/></svg>`;
      
      btn.innerHTML = copyIcon;
      pre.style.position = 'relative';
      pre.classList.add('group/pre'); 

      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.innerText || '';
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = checkIcon;
          setTimeout(() => {
            btn.innerHTML = copyIcon;
          }, 2000);
        });
      });

      pre.appendChild(btn);
    });
  }
}
