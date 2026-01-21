import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private API_URL = 'https://ai-chatbot-backend-s8qj.vercel.app/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(messages: any[], model: string) {
    return this.http.post<any>(this.API_URL, {
      messages,
      model
    });
  }

  generateTitle(message: string) {
    return this.http.post<any>(
      'https://ai-chatbot-backend-s8qj.vercel.app/api/title',
      { message }
    );
  }
}
