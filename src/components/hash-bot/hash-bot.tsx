import { Component, Prop, State, h } from '@stencil/core';
import { io, Socket } from 'socket.io-client';

@Component({
  tag: 'hash-bot',
  styleUrl: 'hash-bot.css',
  shadow: true,
})
export class HashBot {
  @Prop() bot_name: string;
  @Prop() agent_uuid: string;
  @Prop() welcome_message: string;
  @Prop() iconsize: number = 40;
  @Prop() chatbotwidth: number = 300;
  @Prop() chatbotheight: number = 400;

  private messagesEndRef: HTMLElement;

  @State() messages: { text: string; sender: 'user' | 'bot' }[] = [];
  @State() isChatOpen: boolean = false;
  @State() unreadMessages: number = 0;
  @State() isBotTyping: boolean = false;
  @State() isDragging: boolean = false;
  @State() chatId: string = '';
  @State() hasStarted: boolean = false;
  @State() exampleQuestions: { question: string; id: string }[] = [];
  @State() inputValue: string = ''; // Add this state
  @State() apiurl: string = 'https://chatbot.prod.alphainterface.ai';

  private socket: Socket;
  private inputRef: HTMLInputElement;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private floatingIconRef: HTMLElement;
  private chatContainerRef: HTMLElement;
  private socketStatus = 'offline';

  // Utility function to generate unique session-like ID
  private generateChatId(): string {
    const letters = Math.random().toString(36).substring(2, 5);
    const numbers = Math.floor(100 + Math.random() * 900);
    return `session-${letters}${numbers}`;
  }

  async componentWillLoad() {
    // On mount, check sessionStorage or create new chat_id
    const existingChatId = sessionStorage.getItem("hash-bot-chat-id");
    if (existingChatId) {
      this.chatId = existingChatId;
    } else {
      const newChatId = this.generateChatId();
      sessionStorage.setItem("hash-bot-chat-id", newChatId);
      this.chatId = newChatId;
    }

    // Fetch example questions from API
    if (this.agent_uuid) {
      try {
        const res = await fetch(this.apiurl + `/api/agents/example-questions/${this.agent_uuid}`);
        const json = await res.json();
        this.exampleQuestions = Array.isArray(json.data) ? json.data : [];
      } catch (err) {
        console.error("Failed to fetch example questions", err);
        this.exampleQuestions = [];
      }
    }
  }

  connectedCallback() {
    this.socket = io(this.apiurl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.socketStatus = 'online';
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('answer', (data: any) => {
      this.isBotTyping = false;
      this.addMessage(data?.answer, 'bot');
    });

    this.socket.on('disconnect', () => {
      this.socketStatus = 'offline';
      console.log('Disconnected from Socket.IO server');
    });
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    this.messages = [...this.messages, { text, sender }];
    if (!this.isChatOpen && sender === 'bot') {
      this.unreadMessages++;
    }
    setTimeout(() => {
      if (this.messagesEndRef) {
        this.messagesEndRef.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }

  toggleChat() {
    if (!this.isDragging) {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) {
        this.unreadMessages = 0;
      }
    }
  }

  handleSendMessage(query?: string, question_id?: string) {
    if(this.socketStatus=='online'){
      if (query) {
      this.inputRef.value = query;
      this.inputValue = query;
    }
    const message = this.inputValue;
    this.hasStarted = true;
    if (message) {
      this.addMessage(message, 'user');
      this.isBotTyping = true;

      this.socket.emit('ask', {
        message: message,
        agent_uuid: this.agent_uuid,
        chat_id: this.chatId,
        question_id: question_id || undefined
      });

      this.inputRef.value = '';
      this.inputValue = '';
    }
    }
  }

  handleDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.offsetX;
    this.dragStartY = event.clientY - this.offsetY;

    window.addEventListener('mousemove', this.handleDragMove);
    window.addEventListener('mouseup', this.handleDragEnd);
  }

  handleDragMove = (event: MouseEvent) => {
    this.offsetX = event.clientX - this.dragStartX;
    this.offsetY = event.clientY - this.dragStartY;

    if (this.floatingIconRef) {
      this.floatingIconRef.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
    }

    if (this.chatContainerRef) {
      this.chatContainerRef.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
    }
  };

  handleDragEnd = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
    this.dragStartX = 0;
    this.dragStartY = 0;
  };

  render() {
    return (
      <div class="hash-bot">
        {/* Floating Button */}
        {!this.isChatOpen && (
          <button
            class="floating-button"
            style={{ width: `${this.iconsize}px`, height: `${this.iconsize}px` }}
            onClick={() => this.toggleChat()}
          >
            <svg class="icon-xl" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" style={{ fill: "white" }} />
            </svg>
          </button>
        )}

        {/* Modal Overlay */}
        {this.isChatOpen && (
          <div class="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) this.toggleChat(); }}>
            <div class="chat-card">

              {/* Header */}
              <div class="chat-header">
                <div class="header-left">
                  <h3 class="header-title">{this.bot_name}</h3>
                  {this.socketStatus=="offline" && (
                    <span class="offline-text">({this.socketStatus})</span>
                  )}
                </div>
                <div class="header-buttons">
                  <button class="header-button close-button" onClick={() => this.toggleChat()}>
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="m18 6-12 12" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div class="chat-content">
                {!this.hasStarted &&  (
                  <div class="welcome-section">
                    {this.welcome_message &&  (
                      <div class="welcome-message">
                      <div class="avatar">
                        <svg class="icon-xl" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" style={{ fill: "white" }} />
                        </svg>
                      </div>
                      <div class="message-content">
                        <p class="description">
                          {this.welcome_message.split("\\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                    )}
                    
                    {this.exampleQuestions.length > 0 && (
                    <div class="questions-section">
                      <h5 class="questions-title">Example Questions</h5>
                      <div class="questions-grid">
                        {this.exampleQuestions.map(q => (
                          <button class="question-button" onClick={() => this.handleSendMessage(q.question, q.id)}>
                            <p class="question-text">{q.question}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    )}
                    
                  </div>
                )}

                {/* Messages */}
                <div class={{ "messages-container": true, hidden: !this.hasStarted }}>
                  {this.messages.map(msg => (
                    <div class={`message ${msg.sender === "user" ? "user" : ""}`}>
                      <div class={`message-bubble ${msg.sender}`}>
                        <p class="message-text">{msg.text}</p>
                        <p class="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={el => (this.messagesEndRef = el as HTMLElement)} />
                </div>
                {this.isBotTyping && this.socketStatus=='online' && (
                    <p class="message-typing-text">Typing...</p>
                )}
                
                {/* Input */}
                <div class="input-area">
                  <div class="input-container">
                    <input
                      type="text"
                      class="message-input"
                      placeholder="How do I get started?"
                      ref={el => (this.inputRef = el as HTMLInputElement)}
                      value={this.inputValue}
                      onInput={e => this.inputValue = (e.target as HTMLInputElement).value}
                      onKeyPress={e => e.key === "Enter" && this.inputValue.trim() && this.handleSendMessage()}
                    />
                    <button
                      class="send-button"
                      disabled={!this.inputValue.trim()}
                      onClick={() => this.handleSendMessage()}
                    >
                      <svg class="icon" viewBox="0 0 24 24">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div class="chat-footer">
                <div class="powered-by">
                  <span>Powered by</span>
                  <span class="powered-by-brand">AlphaInterface</span>
                </div>
                <button class="clear-chat-button" onClick={() => {
                  this.messages = [];
                  this.hasStarted = false;
                }}>
                  Clear chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
