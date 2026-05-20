import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Paperclip, Mic, ArrowUp, Send, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-4 animate-[slide-up_0.5s_ease-out]">
      <div class="relative flex items-end gap-2 p-2 rounded-3xl bg-bg-surface/90 backdrop-blur-xl border border-border-subtle shadow-elevated neumorph-panel glass-panel transition-all focus-within:ring-2 focus-within:ring-accent-primary/20 focus-within:border-accent-primary/50">
        
        <!-- Attachment Button -->
        <button class="p-3 text-text-muted hover:text-text-main hover:bg-bg-elevated rounded-2xl transition-all shrink-0">
          <lucide-icon [img]="Paperclip" class="w-5 h-5"></lucide-icon>
        </button>

        <!-- Auto-resizing Textarea -->
        <textarea #textarea
                  [(ngModel)]="message"
                  (input)="resizeTextarea()"
                  (keydown.enter)="handleEnter($event)"
                  placeholder="Message Ang..."
                  class="flex-1 max-h-50 min-h-11  bg-transparent border-none outline-none resize-none text-text-main text-[15px] placeholder-text-muted overflow-y-auto scrollbar-hide"></textarea>
        
        <div class="flex items-center gap-2 shrink-0 pb-1 pr-1">
          <!-- Voice Button -->
          <button class="p-2.5 text-text-muted hover:text-text-main hover:bg-bg-elevated rounded-2xl transition-all"
                  *ngIf="!message.trim()">
            <lucide-icon [img]="Mic" class="w-5 h-5"></lucide-icon>
          </button>

          <!-- Send Button -->
          <button class="p-2.5 rounded-2xl transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
                  [ngClass]="{
                    'bg-text-main text-bg-main hover:opacity-90 active:scale-95 shadow-md': message.trim() && !isGenerating,
                    'bg-bg-elevated text-text-muted': !message.trim() || isGenerating
                  }"
                  [disabled]="!message.trim() || isGenerating"
                  (click)="sendMessage()">
            <lucide-icon *ngIf="!isGenerating" [img]="message.trim() ? ArrowUp : Send" class="w-5 h-5 transition-transform" [class.rotate-45]="!message.trim()"></lucide-icon>
            <lucide-icon *ngIf="isGenerating" [img]="Loader2" class="w-5 h-5 animate-spin"></lucide-icon>
          </button>
        </div>
      </div>
      
      <div class="text-center mt-3 text-[11px] text-text-muted">
        Ang can make mistakes. Verify important information.
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `]
})
export class MessageComposerComponent implements AfterViewInit {
  @Output() onSend = new EventEmitter<string>();
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  message = '';
  @Input() isGenerating = false;

  Paperclip = Paperclip;
  Mic = Mic;
  ArrowUp = ArrowUp;
  Send = Send;
  Loader2 = Loader2;

  ngAfterViewInit() {
    setTimeout(() => this.textareaRef.nativeElement.focus(), 100);
  }

  resizeTextarea() {
    const el = this.textareaRef.nativeElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.message.trim() && !this.isGenerating) {
      this.onSend.emit(this.message.trim());
      this.message = '';
      setTimeout(() => this.resizeTextarea(), 0);
    }
  }
}
