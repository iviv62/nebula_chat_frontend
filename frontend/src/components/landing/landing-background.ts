import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import stylesRaw from "./landing-background.styles.scss?inline";

@customElement("landing-background")
export class LandingBackground extends LitElement {
  static styles = unsafeCSS(stylesRaw);

  @property({ type: String }) theme = "dark";

  private _starsAnimId: number | null = null;

  override firstUpdated() {
    this._initStarfield();
    window.addEventListener("resize", this._onResize);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._starsAnimId !== null) cancelAnimationFrame(this._starsAnimId);
    window.removeEventListener("resize", this._onResize);
  }

  override updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("theme")) {
      this._initStarfield();
    }
  }

  private _onResize = () => this._initStarfield();

  private _initStarfield() {
    const canvas = this.shadowRoot?.getElementById("starsCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    if (this._starsAnimId !== null) cancelAnimationFrame(this._starsAnimId);

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = this.theme === "dark";
    const COUNT  = isDark ? 130 : 60;

    interface Star {
      x: number; y: number;
      radius: number;
      alpha: number;
      speed: number;
      color: string;
    }

    const STAR_COLORS_DARK  = ["#ffffff", "#c8d8ff", "#ffd6e0", "#d0f0ff"];
    const STAR_COLORS_LIGHT = ["#334155", "#475569", "#1e293b"];

    const stars: Star[] = Array.from({ length: COUNT }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      radius: 0.4 + Math.random() * (isDark ? 1.3 : 0.8),
      alpha:  Math.random(),
      speed:  0.004 + Math.random() * 0.012,
      color:  isDark
        ? STAR_COLORS_DARK [Math.floor(Math.random() * STAR_COLORS_DARK.length)]
        : STAR_COLORS_LIGHT[Math.floor(Math.random() * STAR_COLORS_LIGHT.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, star.alpha));
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      this._starsAnimId = requestAnimationFrame(draw);
    };
    draw();
  }

  render() {
    return html`
      <div class="space-bg" aria-hidden="true" data-theme=${this.theme}>
        <canvas id="starsCanvas" class="stars-canvas"></canvas>
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        <div class="nebula nebula-4"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-background": LandingBackground;
  }
}
