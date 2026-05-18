import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import stylesRaw from "./landing-hero.styles.scss?inline";
import "../ui/app-button";

@customElement("landing-hero")
export class LandingHero extends LitElement {
  static styles = unsafeCSS(stylesRaw);

  @property({ type: String }) theme = "dark";

  private _githubStarIcon() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>`;
  }

  private _starIcon() {
    return html`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }

  render() {
    return html`
      <section class="hero-section" data-theme=${this.theme}>
        <div class="version-badge"><span class="dot"></span> Nebula v2.0 is now live</div>
        <h1 class="hero-title">The Open-Source Discord Alternative</h1>
        <p class="hero-subtitle">
          The open-source, self-hostable community chat. Immersive spaces,
          spatial audio, and absolute control over your data—no ads, no tracking.
        </p>
        <div class="hero-actions">
          <a
            class="github-btn"
            href="https://github.com/iviv62/chat-system"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star chat-system on GitHub"
          >
            ${this._githubStarIcon()}
            <span>Star on GitHub</span>
            ${this._starIcon()}
          </a>
          <app-button class="secondary-btn">Open in Browser</app-button>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-hero": LandingHero;
  }
}
