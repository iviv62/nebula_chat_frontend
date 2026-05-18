import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import stylesRaw from "./landing-footer.styles.scss?inline";

@customElement("landing-footer")
export class LandingFooter extends LitElement {
  static styles = unsafeCSS(stylesRaw);

  render() {
    return html`
      <footer class="landing-footer">
        <div class="footer-left">
          <div class="logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span class="logo-text">Nebula Chat</span>
          </div>
          <div class="copyright">© 2026 Nebula Chat. All rights reserved.</div>
        </div>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
          <a href="#">Status</a>
          <a href="#">Twitter</a>
          <a href="#">GitHub</a>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-footer": LandingFooter;
  }
}
