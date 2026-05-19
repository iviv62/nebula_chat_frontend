import { LitElement, html, nothing, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import chatActiveCallStylesRaw from "../../styles/chat-active-call.styles.scss?inline";
import type { VoiceParticipant } from "../../features/lib/chat/chat-room-api";
import type { ConnectionMetrics } from "../../features/lib/chat/connection-monitor";
import {
  iconWaveform,
  iconChat,
  iconMaximize,
  iconVideoCameraOff,
  iconMonitor,
  iconMicOff,
  iconMic,
  iconPhoneOff,
  iconVolumeOff,
  iconVolume,
  iconSettings,
  iconExpand,
} from "./chat-icons";

/** Avatar palette — kept as a constant to avoid per-render allocation. */
const AVATAR_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#10b981",
  "#ef4444",
];

@customElement("chat-active-call")
export class ChatActiveCall extends LitElement {
  static styles = unsafeCSS(chatActiveCallStylesRaw);

  @property() roomName = "";
  @property() username = "";
  @property({ type: Array }) participants: VoiceParticipant[] = [];
  @property() callState: string = "idle";
  @property({ type: Boolean }) isMuted = false;
  @property({ type: Boolean }) isScreenSharing = false;
  @property() screenSharingUser: string | null = null;
  @property({ attribute: false }) screenShareStream: MediaStream | null = null;
  @property({ type: Object }) connectionMetrics: ConnectionMetrics | null = null;
  /**
   * Unix epoch (seconds) at which the call started, as returned by the backend
   * GET /voice/{room}/status `call_start_time` field.
   * When provided, the timer is seeded from this value so all participants
   * (including late joiners) see the same elapsed duration.
   * Falls back to Date.now() if null.
   */
  @property({ type: Number }) backendCallStartTime: number | null = null;

  @state() private timer = "00:00";
  @state() private showVolumeSlider = false;
  @state() private volume = 80;
  @state() private isScreenShareLoading = false;
  @query(".active-call__screen-video") private screenVideoEl?: HTMLVideoElement;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callStartTime = 0;

  /**
   * Deduped participant map derived from `this.participants` + self.
   * Computed as a getter so render() stays a pure projection; the underlying
   * reactive properties already gate re-renders, so no extra allocation occurs
   * beyond what Lit would schedule anyway.
   */
  private get uniqueParticipants(): VoiceParticipant[] {
    const map = new Map<string, VoiceParticipant>();
    map.set(this.username, { peer_id: "self", username: this.username });
    for (const p of this.participants) {
      if (p.username !== this.username) {
        map.set(p.username, p);
      }
    }
    return Array.from(map.values());
  }

  disconnectedCallback() {
    // Only stop the interval; do NOT reset the display here.
    // The timer display resets when callState transitions away from "active".
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    super.disconnectedCallback();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("callState")) {
      if (this.callState === "active") {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }

    // If the backend start time arrives after callState is already active
    // (e.g. status fetch resolves after the WS join event), restart the timer
    // so the elapsed offset is applied immediately — but only if the value
    // actually changed to avoid a flicker on parent re-renders.
    if (
      changedProperties.has("backendCallStartTime") &&
      this.callState === "active" &&
      this.backendCallStartTime != null &&
      this.backendCallStartTime !== this.callStartTime / 1000
    ) {
      this.stopTimer();
      this.startTimer();
    }

    if (changedProperties.has("screenShareStream") || changedProperties.has("screenSharingUser")) {
      this.isScreenShareLoading = Boolean(this.screenSharingUser && !this.screenShareStream);
      void this.bindScreenShareVideo();
    }
  }

  private async bindScreenShareVideo() {
    // Do NOT call this.requestUpdate() here — this method is invoked from
    // updated(), which already ran after a reactive-property change triggered
    // a render. A second requestUpdate() would queue a redundant render cycle.
    await this.updateComplete;
    const video = this.screenVideoEl;
    if (!video) return;

    // Pause and clear before assigning a new srcObject to release held resources.
    video.pause();
    video.srcObject = this.screenShareStream ?? null;

    if (!this.screenShareStream) return;

    await video.play().catch(() => {
      // Autoplay can be blocked transiently by browser policies; user interaction will recover.
    });
    this.isScreenShareLoading = false;
  }

  private startTimer() {
    if (this.intervalId) return;
    // Seed from backend timestamp (Unix seconds → ms) when available so that
    // all participants — including late joiners — see the same elapsed duration.
    // Falls back to Date.now() when no backend value is present.
    this.callStartTime =
      this.backendCallStartTime != null
        ? this.backendCallStartTime * 1000
        : Date.now();

    // Render the first tick synchronously to avoid a 1-second blank flash.
    this.tickTimer();
    this.intervalId = setInterval(() => this.tickTimer(), 1000);
  }

  private tickTimer() {
    const diff = Math.max(0, Math.floor((Date.now() - this.callStartTime) / 1000));
    const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
    const seconds = String(diff % 60).padStart(2, "0");
    this.timer = `${minutes}:${seconds}`;
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timer = "00:00";
  }

  private getInitials(name: string) {
    return name ? name.substring(0, 2).toUpperCase() : "?";
  }

  private getColorForUser(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  private handleEndCall() {
    this.dispatchEvent(new CustomEvent("voice-stop", { bubbles: true, composed: true }));
  }

  private handleVolumeChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.volume = Number(input.value);
    this.dispatchEvent(
      new CustomEvent("voice-volume-change", {
        detail: { volume: this.volume },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleScreenShareToggle() {
    this.dispatchEvent(new CustomEvent("screen-share-toggle", { bubbles: true, composed: true }));
  }

  private async handleScreenShareFullscreen() {
    const video = this.screenVideoEl;
    if (!video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await video.requestFullscreen();
    } catch (err) {
      // Fullscreen can fail on unsupported browsers or policy restrictions.
      if (import.meta.env?.DEV) {
        console.warn("[chat-active-call] Fullscreen request failed:", err);
      }
    }
  }

  render() {
    if (this.callState === "idle" || this.callState === "error") return nothing;

    return html`
      <div class="active-call">
        <!-- Header -->
        <div class="active-call__header">
          <div class="active-call__header-left">
            ${iconWaveform}
            <span class="active-call__header-title">
              VOICE ${this.callState === "calling" ? "CONNECTING..." : "CONNECTED"} /
              ${this.roomName.toUpperCase()}
            </span>
          </div>
          <div class="active-call__header-right">
            <span class="active-call__timer">${this.timer}</span>
            <button
              class="active-call__icon-btn"
              title="View Chat"
              aria-label="View Chat"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("return-to-chat", { bubbles: true, composed: true }),
                )}
            >
              ${iconChat}
            </button>
          </div>
        </div>

        ${this.connectionMetrics
          ? html`
              <div class="active-call__metrics">
                <div class="active-call__metrics-title">Connection</div>
                <div>Ping: ${this.connectionMetrics.latencyMs} ms</div>
                <div>Loss: ${this.connectionMetrics.packetLossPct}%</div>
                <div>BW: ${this.connectionMetrics.bandwidthMbps} Mbps</div>
                <div>FPS: ${this.connectionMetrics.fps}</div>
              </div>
            `
          : nothing}

        <!-- Grid -->
        <div class="active-call__grid">
          ${this.uniqueParticipants.map((p) => {
            const isSelf = p.username === this.username;
            const color = this.getColorForUser(p.username);
            const initials = this.getInitials(p.username);

            return html`
              <div class="active-call__card" id=${p.peer_id}>
                <div class="active-call__avatar-wrap">
                  <div class="active-call__avatar" style="background-color: ${color}">
                    ${initials}
                  </div>
                </div>
                <div class="active-call__card-controls">
                  <div class="active-call__badge">
                    ${p.username}
                    ${isSelf ? html`<span class="active-call__badge-you">YOU</span>` : ""}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>

        ${this.screenShareStream || this.screenSharingUser
          ? html`
              <div class="active-call__screen-share">
                <div class="active-call__screen-share-header">
                  <p class="active-call__screen-share-label">
                    ${this.screenSharingUser
                      ? `${this.screenSharingUser} is sharing their screen`
                      : "Screen share is live"}
                  </p>
                  <button
                    type="button"
                    class="active-call__screen-fullscreen-btn"
                    @click=${this.handleScreenShareFullscreen}
                    ?disabled=${!this.screenShareStream}
                    title="Fullscreen"
                    aria-label="Fullscreen screen share"
                  >
                    ${iconMaximize}
                  </button>
                </div>
                ${this.isScreenShareLoading
                  ? html`
                      <div class="active-call__screen-loading" role="status" aria-live="polite">
                        <span class="active-call__screen-spinner"></span>
                        <span>Establishing screen share...</span>
                      </div>
                    `
                  : nothing}
                <video class="active-call__screen-video" autoplay playsinline muted></video>
              </div>
            `
          : nothing}

        <!-- Toolbar -->
        <div class="active-call__toolbar">
          <div class="active-call__toolbar-center">
            <button class="active-call__toolbar-btn" title="Toggle video" aria-label="Toggle video">
              ${iconVideoCameraOff}
            </button>
            <button
              class="active-call__toolbar-btn ${this.isScreenSharing
                ? "active-call__toolbar-btn--active"
                : ""}"
              title=${this.isScreenSharing ? "Stop sharing screen" : "Share screen"}
              aria-label=${this.isScreenSharing ? "Stop sharing screen" : "Share screen"}
              @click=${this.handleScreenShareToggle}
            >
              ${iconMonitor}
            </button>
            <div class="active-call__toolbar-divider"></div>
            <button
              class="active-call__toolbar-btn ${this.isMuted
                ? "active-call__toolbar-btn--muted"
                : ""}"
              title=${this.isMuted ? "Unmute microphone" : "Mute microphone"}
              aria-label=${this.isMuted ? "Unmute microphone" : "Mute microphone"}
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("voice-mute-toggle", {
                    detail: { muted: !this.isMuted },
                    bubbles: true,
                    composed: true,
                  }),
                )}
            >
              ${this.isMuted ? iconMicOff : iconMic}
            </button>
            <button
              class="active-call__toolbar-btn active-call__toolbar-btn--end"
              title="End call"
              aria-label="End call"
              @click=${this.handleEndCall}
            >
              ${iconPhoneOff}
            </button>
          </div>
          <div class="active-call__toolbar-right">
            <div style="position: relative; display: inline-block;">
              ${this.showVolumeSlider
                ? html`
                    <div
                      style="position: fixed; inset: 0; z-index: 99;"
                      @click=${() => (this.showVolumeSlider = false)}
                    ></div>
                    <div class="active-call__volume-popup">
                      <span class="active-call__volume-label">${this.volume}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        aria-label="Volume slider"
                        .value=${String(this.volume)}
                        @input=${this.handleVolumeChange}
                        class="active-call__volume-slider"
                      />
                    </div>
                  `
                : nothing}
              <button
                class="active-call__icon-btn"
                title=${this.volume === 0 ? "Unmute volume" : "Mute volume"}
                aria-label=${this.volume === 0 ? "Unmute volume" : "Mute volume"}
                @click=${() => (this.showVolumeSlider = !this.showVolumeSlider)}
              >
                ${this.volume === 0 ? iconVolumeOff : iconVolume}
              </button>
            </div>
            <button
              class="active-call__icon-btn"
              title="Settings"
              aria-label="Settings"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("open-settings", { bubbles: true, composed: true }),
                )}
            >
              ${iconSettings}
            </button>
            <button class="active-call__icon-btn" title="Expand view" aria-label="Expand view">
              ${iconExpand}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chat-active-call": ChatActiveCall;
  }
}
