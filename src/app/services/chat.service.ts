import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'ai-chatbot-backend-s8qj.vercel.app/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string) {
    return this.http.post<{ reply: string }>(
      this.apiUrl,
      { message }
    );
  }
}
