import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../styles/user-profile.styles.scss"; // Compile styling into global css
import { navigate } from "../../utils/navigate";

@customElement("user-profile")
export class UserProfile extends LitElement {
  // Opt out of shadow DOM to allow global CSS
  createRenderRoot() {
    return this;
  }

  @property() username = "Jane Smith";

  render() {
    return html`
      <div class="profile">
        <div class="profile__header">
          <button class="profile__btn-back" @click=${() => navigate("/chat")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Lobby
          </button>
        </div>

        <div class="profile__banner-container"></div>

        <div class="profile__main-card">
          <div class="profile__user-info-row">
            <div class="profile__avatar-wrapper">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3087&auto=format&fit=crop" alt="Profile Picture" />
              <div class="profile__status-dot"></div>
            </div>

            <div class="profile__details">
              <h1>${this.username}</h1>
              <p>@${this.username.toLowerCase().replace(/\s+/g, '')} • Lead UI Engineer</p>
            </div>
          </div>

          <div class="profile__actions">
            <button class="profile__btn profile__btn--primary">Message</button>
            <button class="profile__btn profile__btn--icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </button>
          </div>
        </div>

        <div class="profile__layout">
          <div class="profile__sidebar">
            <div class="profile__card">
              <h2 class="profile__card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                About Me
              </h2>
              <p class="profile__about-text">
                Obsessed with creating seamless digital experiences. Currently exploring the intersection of spatial computing and glassmorphism. Always up for a chat about design systems or sci-fi novels.
              </p>
              <div class="profile__tags">
                <span class="profile__tag">FIGMA</span>
                <span class="profile__tag">REACT</span>
                <span class="profile__tag">CSS</span>
              </div>
            </div>

            <div class="profile__card">
              <div class="profile__stats-grid">
                <div class="profile__stat-box">
                  <div class="num">248</div>
                  <div class="label">Friends</div>
                </div>
                <div class="profile__stat-box">
                  <div class="num">15</div>
                  <div class="label">Servers</div>
                </div>
              </div>
            </div>

            <div class="profile__card">
              <h2 class="profile__card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/></svg>
                Mutual Servers
              </h2>
              <div class="profile__server-list">
                <div class="profile__server-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <div class="profile__server-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>
                </div>
                <div class="profile__server-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                </div>
                <div class="profile__server-icon">+2</div>
              </div>
            </div>
          </div>

          <div class="profile__main-content">
            <div class="profile__card" style="height: 100%;">
              <div class="profile__card-header-flex">
                <h2>Recent Activity</h2>
                <a href="#" class="view-all">View All</a>
              </div>

              <div class="profile__timeline">
                <div class="profile__timeline-item">
                  <div class="profile__timeline-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div class="profile__activity-card">
                    <div class="profile__activity-header">
                      <span class="type">COMMENTED</span>
                      <span class="time">2h ago</span>
                    </div>
                    <div class="profile__activity-content">
                      <p>"I think the new layout grid looks incredible. The backdrop blur really adds that depth we were looking for."</p>
                    </div>
                    <div class="profile__activity-footer">
                      in <strong>#design-system-v2</strong>
                    </div>
                  </div>
                </div>

                <div class="profile__timeline-item">
                  <div class="profile__timeline-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                  <div class="profile__activity-card">
                    <div class="profile__activity-header">
                      <span class="type">SHARED MEDIA</span>
                      <span class="time">Yesterday</span>
                    </div>
                    <div class="profile__activity-media"></div>
                    <div class="profile__activity-footer">
                      in <strong>#ui-inspiration</strong>
                    </div>
                  </div>
                </div>

                <div class="profile__timeline-item">
                  <div class="profile__timeline-icon green">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  </div>
                  <div class="profile__activity-card">
                    <div class="profile__activity-header">
                      <span class="type" style="color: var(--status-indicator);">JOINED SERVER</span>
                      <span class="time">3 days ago</span>
                    </div>
                    <div class="profile__activity-content">
                      <p>Joined <strong>Frontend Wizards</strong> community.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
