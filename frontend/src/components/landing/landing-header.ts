import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { handleLink } from "../../utils/navigate";
import stylesRaw from "./landing-header.styles.scss?inline";

@customElement("landing-header")
export class LandingHeader extends LitElement {
  static styles = unsafeCSS(stylesRaw);

  @property({ type: String }) theme = "dark";
  @property({ type: Function }) toggleTheme!: () => void;

  private _sunIcon() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;
  }

  private _moonIcon() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
  }

  render() {
    const isDark = this.theme === "dark";

    return html`
      <header class="landing-header" data-theme=${this.theme}>
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span class="logo-text">Nebula Chat</span>
        </div>

        <nav class="nav-links">
          <a href="#" class="active">Features</a>
          <a href="#">Communities</a>
        </nav>

        <div class="header-actions">
          <button
            class="theme-toggle"
            @click=${this.toggleTheme}
            aria-label=${isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            ${isDark ? this._sunIcon() : this._moonIcon()}
          </button>
          <a href="/login" class="login-btn" @click=${handleLink}>Login</a>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-header": LandingHeader;
  }
}
