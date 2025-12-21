import { Component } from '@angular/core';
import { ChatComponent } from "./pages/chat/chat.component";

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ai-chatbot';
}
