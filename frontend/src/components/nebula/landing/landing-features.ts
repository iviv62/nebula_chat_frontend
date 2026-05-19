import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import featuresStylesRaw from "../../../styles/landing/landing-features.styles.scss?inline";
import {
  mockupUserIcon,
  addToChannelIcon,
  spatialAudioIcon,
  customizeIcon,
  lightningIcon,
  shieldCheckIcon,
  integrationsIcon,
} from "./landing-icons";

@customElement("landing-features")
export class LandingFeatures extends LitElement {
  static styles = unsafeCSS(featuresStylesRaw);

  render() {
    return html`
      <section class="features-grid">
        <div class="top-row">
          <div class="feature-card main-feature">
            <div class="card-header"><span class="hashtag">#</span> design-discussions</div>
            <div class="card-content image-mockup">
              <div class="mockup-window">
                <div class="mockup-sidebar"></div>
                <div class="mockup-main">
                  <div class="mockup-message"></div>
                  <div class="mockup-message"></div>
                  <div class="mockup-avatar-large">${mockupUserIcon}</div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="plus-icon">${addToChannelIcon}</span>
              <span class="placeholder-text">Message #design-discussions...</span>
            </div>
          </div>

          <div class="side-features">
            <div class="feature-card">
              <div class="card-top">
                <div class="icon-wrapper">${spatialAudioIcon}</div>
                <div class="live-badge"><span class="dot"></span> Live</div>
              </div>
              <h3>Spatial Audio</h3>
              <p>Crystal clear, low-latency voice channels that make you feel like you're in the same room.</p>
            </div>
            <div class="feature-card">
              <div class="icon-wrapper">${customizeIcon}</div>
              <h3>Deep Customization</h3>
              <p>Fully open source. Fork it, tweak the UI, or build custom plugins to make Nebula truly yours.</p>
            </div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="feature-card">
            <div class="icon-wrapper">${lightningIcon}</div>
            <h3>Lightning Fast</h3>
            <p>Built on a proprietary lightweight engine, Nebula stays fast even in communities with millions of members.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">${shieldCheckIcon}</div>
            <h3>100% Data Ownership</h3>
            <p>Host Nebula on your own hardware. Your community's messages, voice data, and files stay entirely on your server—giving you absolute privacy and freedom from tech monopolies.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">${integrationsIcon}</div>
            <h3>Rich Integrations</h3>
            <p>Connect your favorite tools directly into chat with our expansive App Directory and robust API.</p>
          </div>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "landing-features": LandingFeatures;
  }
}
