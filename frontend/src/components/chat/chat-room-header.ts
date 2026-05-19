import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { VoiceCallState } from "../../features/lib/chat/webrtc-adapter";
import { iconPhone, iconVideo } from "./chat-icons";

@customElement("chat-room-header")
export class ChatRoomHeader extends LitElement {
  @property()
  roomName = "";

  @property()
  roomId = "";

  @property()
  username = "Guest";

  @property()
  theme: "light" | "dark" = "light";

  @property({ type: Boolean })
  isReconnecting = false;

  @property({ type: Number })
  onlineCount = 0;

  @property()
  voiceState: VoiceCallState = "idle";

  @property({ type: Boolean })
  showMembers = true;

  createRenderRoot() {
    return this;
  }

  private handleVoiceClick() {
    const event =
      this.voiceState === "active" || this.voiceState === "calling" ? "voice-stop" : "voice-start";
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }));
  }

  private handleToggleMembersClick() {
    this.dispatchEvent(new CustomEvent("toggle-members", { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <header class="chat-room__header">
        <div class="chat-room__header-left">
          <h2 class="chat-room__title">${this.roomName || this.roomId}</h2>
          <p class="chat-room__meta">
            <span class="chat-room__online">${this.onlineCount} members online</span>
          </p>
        </div>
        <div class="chat-room__header-right" style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="chat-room__header-call-group">
            <button
              class="chat-room__header-action ${this.voiceState === "active"
                ? "chat-room__header-action--active"
                : ""}"
              type="button"
              title=${this.voiceState === "active" ? "End call" : "Start voice call"}
              aria-label=${this.voiceState === "active" ? "End call" : "Start voice call"}
              @click=${this.handleVoiceClick}
            >
              ${iconPhone}
            </button>
            <button
              class="chat-room__header-action"
              type="button"
              title="Video call"
              aria-label="Video call"
            >
              ${iconVideo}
            </button>
            <button
              class="chat-room__header-action ${this.showMembers
                ? "chat-room__header-action--active"
                : ""}"
              type="button"
              title="Toggle members"
              aria-label="Toggle members panel"
              @click=${this.handleToggleMembersClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </button>
          </div>
        </div>
      </header>

      ${this.isReconnecting ? html`<div class="chat-room__banner">Reconnecting…</div>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chat-room-header": ChatRoomHeader;
  }
}
