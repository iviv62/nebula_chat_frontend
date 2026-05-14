import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("lobby-create-room")
export class LobbyCreateRoom extends LitElement {
  createRenderRoot() { return this; }

  @property() error = "";
  @state() private newRoomName = "";

  private handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.newRoomName.trim()) return;
    this.dispatchEvent(new CustomEvent("create-room", {
      detail: this.newRoomName.trim(),
      bubbles: true, composed: true
    }));
    this.newRoomName = "";
  }

  render() {
    return html`
      <div class="lobby__create-banner">
        <div class="lobby__create-banner-content">
          <span class="lobby__create-banner-label">Create a New Room</span>
          ${this.error ? html`<span class="lobby__create-banner-error">${this.error}</span>` : ""}
        </div>
        <form class="lobby__create-form" @submit=${this.handleSubmit}>
          <input
            class="lobby__input lobby__create-input"
            type="text"
            placeholder="Room name…"
            .value=${this.newRoomName}
            @input=${(e: Event) => (this.newRoomName = (e.target as HTMLInputElement).value)}
          />
          <button
            class="lobby__btn lobby__btn--create"
            type="submit"
            ?disabled=${!this.newRoomName.trim()}
          >+ Create Room</button>
        </form>
      </div>
    `;
  }
}
