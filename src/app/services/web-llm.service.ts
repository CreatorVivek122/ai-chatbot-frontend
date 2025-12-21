import { Injectable } from '@angular/core';
import * as webllm from '@mlc-ai/web-llm';

@Injectable({
  providedIn: 'root'
})
export class WebLlmService {

  private engine: webllm.MLCEngine | null = null;

  async initModel() {
    if (this.engine) return;

    this.engine = new webllm.MLCEngine();
    await this.engine.reload('Llama-3.1-8B-Instruct-q4f32_1-MLC');
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.engine) {
      throw new Error('Model not initialized');
    }

    const reply = await this.engine.chat.completions.create({
      messages: [{ role: 'user', content: message }]
    });

    const content = reply.choices[0].message.content;

    return content ?? "😔 Sorry!! No response From Chatbot."
  }
}
