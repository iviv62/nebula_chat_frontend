import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { logout } from "../../features/lib/auth/auth-api";
import { navigate } from "../../utils/navigate";
import { ThemeController } from "../../utils/theme-controller";

@customElement("lobby-header")
export class LobbyHeader extends LitElement {
  createRenderRoot() { return this; }

  @property() theme: "light" | "dark" = "light";

  private async handleLogout() {
    try { await logout(); } catch (e) { console.error("Logout failed", e); } finally { navigate("/login"); }
  }

  private handleThemeToggle() {
    const next = this.theme === "light" ? "dark" : "light";
    ThemeController.set(next);
    this.dispatchEvent(new CustomEvent("toggle-theme", {
      detail: { theme: next }, bubbles: true, composed: true
    }));
  }

  render() {
    const isDark = this.theme === "dark";
    return html`
      <header class="lobby__header">
        <h1 class="lobby__title">Chat Lobby</h1>
        <div class="lobby__header-actions">
          <button
            class="lobby__theme-toggle"
            @click=${this.handleThemeToggle}
            aria-label="Toggle theme"
          >
            ${isDark
              ? html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
              : html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`}
          </button>
          <button class="lobby__btn lobby__btn--logout" @click=${this.handleLogout}>Logout</button>
        </div>
      </header>
    `;
  }
}
