import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import pageLandingStylesRaw from "../styles/page-landing.styles.scss?inline";
import { ThemeController } from "../utils/theme-controller";

// Import landing components
import "../components/landing/landing-background";
import "../components/landing/landing-header";
import "../components/landing/landing-hero";
import "../components/landing/landing-features";
import "../components/landing/landing-orbits";
import "../components/landing/landing-footer";

@customElement("page-landing")
export class PageLanding extends LitElement {
  static styles = unsafeCSS(pageLandingStylesRaw);

  private theme = new ThemeController(this);

  constructor() {
    super();
    this.setAttribute("data-theme", ThemeController.get());
  }

  private _toggleTheme = () => {
    const next = this.theme.theme === "dark" ? "light" : "dark";
    ThemeController.set(next);
  };

  render() {
    const currentTheme = this.theme.theme;

    return html`
      <div class="landing-container">
        <!-- ── Space background (fixed, behind everything) ── -->
        <landing-background theme=${currentTheme}></landing-background>

        <landing-header theme=${currentTheme} .toggleTheme=${this._toggleTheme}></landing-header>

        <main class="landing-main">
          <landing-hero theme=${currentTheme}></landing-hero>
          <landing-features theme=${currentTheme}></landing-features>
          <landing-orbits theme=${currentTheme}></landing-orbits>
        </main>

        <landing-footer></landing-footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "page-landing": PageLanding;
  }
}
