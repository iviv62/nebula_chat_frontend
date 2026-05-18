import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import stylesRaw from "./landing-orbits.styles.scss?inline";

@customElement("landing-orbits")
export class LandingOrbits extends LitElement {
  static styles = unsafeCSS(stylesRaw);

  @property({ type: String }) theme = "dark";

  render() {
    const orbitUsers = [
      { name: "AK", avatar: "/avatars/avatar_ak.png", label: "1", radius: "216px", speed: "60s", delay: "-45s",    online: false },
      { name: "SL", avatar: "/avatars/avatar_sl.png", label: "2", radius: "156px", speed: "45s", delay: "-37.5s",  online: false },
      { name: "MR", avatar: "/avatars/avatar_mr.png", label: "2", radius: "156px", speed: "45s", delay: "-22.5s",  online: false },
      { name: "JT", avatar: "/avatars/avatar_jt.png", label: "1", radius: "216px", speed: "60s", delay: "-20s",    online: false },
      { name: "EV", avatar: "/avatars/avatar_ev.png", label: "3", radius:  "91px", speed: "30s", delay: "0s",      online: true  },
      { name: "NB", avatar: "/avatars/avatar_nb.png", label: "2", radius: "156px", speed: "45s", delay: "-11.25s", online: false },
    ];

    return html`
      <section class="orbits-section" aria-labelledby="orbits-title" data-theme=${this.theme}>
        <div class="orbits-header">
          <h2 id="orbits-title" class="orbits-title">Discover Your Common Orbits</h2>
          <p class="orbits-subtitle">
            See who shares your spaces. The closer the orbit, the more mutual servers you
            have in common. Click on any profile to connect!
          </p>
        </div>

        <div class="orbit-stage" role="img" aria-label="Orbit diagram showing users in shared servers">
          <div class="orbit-ring orbit-ring--far"  aria-hidden="true"></div>
          <div class="orbit-ring orbit-ring--mid"  aria-hidden="true"></div>
          <div class="orbit-ring orbit-ring--near" aria-hidden="true"></div>

          <div class="orbit-legend" aria-hidden="true">
            <div class="orbit-legend-item orbit-legend-item--far">
              <span class="orbit-legend-dot orbit-legend-dot--far"></span>
              <span class="orbit-legend-text">1 SERVER</span>
            </div>
            <div class="orbit-legend-item orbit-legend-item--mid">
              <span class="orbit-legend-dot orbit-legend-dot--mid"></span>
              <span class="orbit-legend-text">2 SERVERS</span>
            </div>
            <div class="orbit-legend-item orbit-legend-item--near">
              <span class="orbit-legend-dot orbit-legend-dot--near"></span>
              <span class="orbit-legend-text">3+ SERVERS</span>
            </div>
          </div>

          <div class="orbit-center" aria-label="Your profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="orbit-center__dot"></span>
          </div>

          ${orbitUsers.map(
            (u) => html`
              <div
                class="orbit-wrap"
                style="--orbit-r:${u.radius};--orbit-speed:${u.speed};--orbit-delay:${u.delay}"
              >
                <div class="orbit-spoke"></div>
                <button
                  class="orbit-avatar"
                  aria-label="${u.name} — ${u.label} mutual server${u.label !== "1" ? "s" : ""}"
                >
                  <img
                    class="orbit-avatar__photo"
                    src=${u.avatar}
                    alt=${u.name}
                    draggable="false"
                  />
                  <span class="orbit-avatar__badge">${u.label}</span>
                  ${u.online ? html`<span class="orbit-avatar__online" aria-hidden="true"></span>` : ""}
                </button>
              </div>
            `
          )}
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-orbits": LandingOrbits;
  }
}
