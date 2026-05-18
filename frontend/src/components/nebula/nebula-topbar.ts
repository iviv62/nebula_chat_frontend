import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { nebulaIcons } from "../../icons/icons";
import { ThemeController } from "../../utils/theme-controller";

@customElement("nebula-topbar")
export class NebulaTopbar extends LitElement {
  themeCtrl = new ThemeController(this);

  createRenderRoot() {
    return this;
  }

  private toggleTheme() {
    const next = this.themeCtrl.theme === "light" ? "dark" : "light";
    ThemeController.set(next);
  }

  render() {
    return html`
      <header class="nebula-topbar">
        <h2 class="topbar-title">Home</h2>

        <div class="topbar-actions">
          <div class="search-box">
            ${nebulaIcons.search}
            <input
              type="text"
              placeholder="Find servers, users, or messages..."
              aria-label="Search"
            />
          </div>

          <button class="icon-btn" aria-label="Toggle Theme" @click=${this.toggleTheme}>
            ${this.themeCtrl.theme === "light" ? nebulaIcons.moon : nebulaIcons.sun}
          </button>

          <div class="user-profile">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&q=80"
              alt="User Profile"
            />
            <span>User</span>
            ${nebulaIcons.chevronDown}
          </div>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nebula-topbar": NebulaTopbar;
  }
}
