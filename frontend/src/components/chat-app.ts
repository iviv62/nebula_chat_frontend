import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "../styles/chat-app.styles.scss";
import "./lobby/lobby-header";
import "./lobby/lobby-create-room";
import {
  fetchRooms,
  createRoom,
  deleteRoom,
  fetchConversationSummary,
  fetchUnreadCount,
  ApiError,
} from "../features/lib/chat/chat-room-api";
import {
  getCurrentPushToken,
  initFirebasePushAndRegister,
} from "../features/lib/notifications/firebase-messaging";
import { subscribeToRoomNotifications } from "../features/lib/notifications/notification-room-subscription-api";
import { ThemeController } from "../utils/theme-controller";
import { navigate } from "../utils/navigate";
import type { Room } from "../types/room";
import type { ConversationSummary } from "../types/conversation-summary";

const TRENDING_ROOMS = [
  { name: "Gaming Hub",   icon: "🎮" },
  { name: "Tech Talk",    icon: "💬" },
  { name: "Music Lounge", icon: "🎵" },
];

const CATEGORIES = ["All", "Gaming", "Tech", "Music", "Social", "Learning"];

@customElement("chat-app")
export class ChatApp extends LitElement {
  createRenderRoot() { return this; }

  @property() username = "";
  @state() private selectedRoomId = "";
  @state() private rooms: Room[] = [];
  @state() private conversationByRoom: Record<string, ConversationSummary> = {};
  @state() private unreadByRoom: Record<string, number> = {};
  @state() private searchQuery = "";
  @state() private activeCategory = "All";
  @state() private isLoadingRooms = true;
  @state() private error = "";

  private themeCtrl = new ThemeController(this);
  private unreadLoadRequestId = 0;
  private notificationRegistrationByUser: Record<string, boolean> = {};
  private subscribedRooms = new Set<string>();

  async connectedCallback() {
    super.connectedCallback();
    ThemeController.set(this.themeCtrl.theme);
    await this.loadRooms();
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has("username")) {
      void this.loadUnreadCountsForUser(this.username);
      this.subscribedRooms.clear();
    }
  }

  private toggleTheme(e?: CustomEvent) {
    const next = e?.detail?.theme ?? (this.themeCtrl.theme === "light" ? "dark" : "light");
    ThemeController.set(next);
  }

  private async loadRooms() {
    this.isLoadingRooms = true;
    this.error = "";
    try {
      const rooms = await fetchRooms();
      this.rooms = rooms;
      const summaryResults = await Promise.allSettled(
        rooms.map(async (room) => {
          const summary = await fetchConversationSummary(room.id);
          return [room.id, summary] as const;
        }),
      );
      const byRoom: Record<string, ConversationSummary> = {};
      for (const result of summaryResults) {
        if (result.status === "fulfilled") {
          const [roomId, summary] = result.value;
          byRoom[roomId] = summary;
        }
      }
      this.conversationByRoom = byRoom;
      await this.loadUnreadCountsForUser(this.username);
      if (this.rooms.length > 0 && !this.selectedRoomId) {
        this.selectedRoomId = this.rooms[0].id;
      }
    } catch {
      this.error = "Failed to load rooms. Ensure the backend is running.";
    } finally {
      this.isLoadingRooms = false;
    }
  }

  private async loadUnreadCountsForUser(username: string) {
    const trimmed = username.trim();
    if (!trimmed || this.rooms.length === 0) { this.unreadByRoom = {}; return; }
    const requestId = ++this.unreadLoadRequestId;
    const unreadResults = await Promise.allSettled(
      this.rooms.map(async (room) => {
        const unread = await fetchUnreadCount(room.id, trimmed);
        return [room.id, unread] as const;
      }),
    );
    if (requestId !== this.unreadLoadRequestId) return;
    const byRoom: Record<string, number> = {};
    for (const result of unreadResults) {
      if (result.status === "fulfilled") {
        const [roomId, unread] = result.value;
        byRoom[roomId] = unread;
      }
    }
    this.unreadByRoom = byRoom;
  }

  private async registerPushForUser(username: string) {
    const trimmed = username.trim();
    if (!trimmed || this.notificationRegistrationByUser[trimmed]) return;
    try {
      await initFirebasePushAndRegister(trimmed);
      this.notificationRegistrationByUser[trimmed] = true;
    } catch (error) {
      console.error("Failed to register push token", error);
    }
  }

  private async syncRoomNotificationSubscription(roomId: string) {
    const username = this.username.trim();
    const targetRoomId = roomId.trim();
    if (!username || !targetRoomId) return;
    const key = `${username}:${targetRoomId}`;
    if (this.subscribedRooms.has(key)) return;
    await this.registerPushForUser(username);
    const token = getCurrentPushToken();
    if (!token) return;
    try {
      await subscribeToRoomNotifications({ username, roomId: targetRoomId, token, provider: "fcm" });
      this.subscribedRooms.add(key);
    } catch (error) {
      console.error("Failed to subscribe to room notifications", error);
    }
  }

  private renderUnreadBadge(roomId: string) {
    const unread = this.unreadByRoom[roomId] ?? 0;
    if (!this.username.trim() || unread <= 0) return null;
    return html`<span class="lobby__unread-badge">${unread}</span>`;
  }

  private async handleCreateRoomFromChild(roomName: string) {
    const trimmed = roomName.trim();
    if (!trimmed) return;
    try {
      const room = await createRoom({ name: trimmed, created_by: this.username.trim() || undefined });
      await this.loadRooms();
      this.selectedRoomId = room.id;
      this.error = "";
      void this.syncRoomNotificationSubscription(room.id);
      navigate(`/chat/${encodeURIComponent(room.id)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        this.error = "A room with that name already exists. Pick a different name.";
      } else {
        this.error = "Failed to create room.";
      }
    }
  }

  private joinRoom(room: Room) {
    if (!this.username.trim()) return;
    this.selectedRoomId = room.id;
    void this.syncRoomNotificationSubscription(room.id);
    navigate(`/chat/${encodeURIComponent(room.id)}`);
  }

  private async handleDeleteRoom(room: Room, e: Event) {
    e.stopPropagation();
    if (!confirm(`Delete room "${room.name}"? This cannot be undone.`)) return;
    try {
      await deleteRoom(room.id, this.username.trim());
      if (this.selectedRoomId === room.id) this.selectedRoomId = "";
      await this.loadRooms();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        this.error = "Only the room creator can delete this room.";
      } else if (error instanceof ApiError && error.status === 404) {
        this.error = "Room not found. It may have already been deleted.";
        await this.loadRooms();
      } else {
        this.error = "Failed to delete room.";
      }
    }
  }

  private renderLastMessagePreview(roomId: string): string {
    const summary = this.conversationByRoom[roomId];
    if (!summary?.last_message_text) return "No messages yet";
    if (!summary.last_message_username) return summary.last_message_text;
    return `${summary.last_message_username}: ${summary.last_message_text}`;
  }

  private getFilteredRooms() {
    return this.rooms.filter((r) =>
      r.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  private getRoomInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "#";
  }

  private renderTrendingRooms() {
    return TRENDING_ROOMS.map((tr) => {
      const match = this.rooms.find((r) => r.name.toLowerCase().includes(tr.name.toLowerCase()));
      return html`
        <div class="lobby__trending-card">
          <div class="lobby__trending-icon">${tr.icon}</div>
          <div class="lobby__trending-info">
            <div class="lobby__trending-name">${tr.name}</div>
            <div class="lobby__trending-participants">Participants</div>
            <div class="lobby__trending-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${match ? (match.participants?.label ?? "0/50") : "0/50"}
            </div>
          </div>
          <button
            class="lobby__btn lobby__btn--join-sm"
            ?disabled=${!this.username.trim()}
            @click=${() => match && this.joinRoom(match)}
          >Join</button>
        </div>
      `;
    });
  }

  private renderRoomFinderTable() {
    const filtered = this.getFilteredRooms();
    if (this.isLoadingRooms) {
      return html`<tr><td colspan="4" class="lobby__table-empty">Loading rooms…</td></tr>`;
    }
    if (filtered.length === 0) {
      return html`<tr><td colspan="4" class="lobby__table-empty">No rooms found.</td></tr>`;
    }
    return repeat(
      filtered,
      (r) => r.id,
      (r) => {
        const unread = this.unreadByRoom[r.id] ?? 0;
        const isOwner = r.created_by && r.created_by === this.username.trim();
        return html`
          <tr
            class="${this.selectedRoomId === r.id ? "selected" : ""}"
            @click=${() => { this.selectedRoomId = r.id; }}
          >
            <td>
              <div class="lobby__room-row">
                <div class="lobby__room-avatar">${this.getRoomInitial(r.name)}</div>
                <div class="lobby__room-row-info">
                  <div class="lobby__room-row-name">
                    ${r.name}
                    ${unread > 0 && this.username.trim()
                      ? html`<span class="lobby__unread-badge">${unread}</span>`
                      : null}
                  </div>
                  <div class="lobby__room-row-preview">${this.renderLastMessagePreview(r.id)}</div>
                  ${r.created_by ? html`<div class="lobby__room-creator">admin: ${r.created_by}</div>` : ""}
                </div>
              </div>
            </td>
            <td>
              <div class="lobby__participants-cell">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                ${r.participants?.label ?? "0/50"}
              </div>
            </td>
            <td>
              ${r.status === "password"
                ? html`<span class="lobby__status lobby__status--private"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Private</span>`
                : html`<span class="lobby__status lobby__status--public"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg> Public</span>`}
            </td>
            <td>
              <div class="lobby__action-cell">
                <button
                  class="lobby__btn lobby__btn--join"
                  ?disabled=${!this.username.trim()}
                  @click=${(e: Event) => { e.stopPropagation(); this.joinRoom(r); }}
                >Join</button>
                ${isOwner
                  ? html`<button
                      class="lobby__btn lobby__btn--delete"
                      @click=${(e: Event) => this.handleDeleteRoom(r, e)}
                    >Delete</button>`
                  : ""}
              </div>
            </td>
          </tr>
        `;
      }
    );
  }

  render() {
    return html`
      <div class="lobby">
        <!-- Header -->
        <lobby-header .theme=${this.themeCtrl.theme} @toggle-theme=${this.toggleTheme}></lobby-header>

        <!-- Two-column layout -->
        <div class="lobby__layout">

          <!-- Left sidebar -->
          <aside class="lobby__sidebar">
            <!-- Signed In User -->
            <div class="lobby__card">
              <h3 class="lobby__card-title">Signed In User</h3>
              <div class="lobby__user-row">
                <div class="lobby__user-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <div class="lobby__label">Username</div>
                  <div class="lobby__username">${this.username || "—"}</div>
                </div>
              </div>
            </div>

            <!-- Servers -->
            <div class="lobby__card">
              <h3 class="lobby__card-title">Servers</h3>
              <div class="lobby__servers">
                ${this.rooms.slice(0, 3).map((r) => html`
                  <button
                    class="lobby__server-icon ${this.selectedRoomId === r.id ? "lobby__server-icon--active" : ""}"
                    title=${r.name}
                    @click=${() => { this.selectedRoomId = r.id; }}
                  >${this.getRoomInitial(r.name)}</button>
                `)}
                <button class="lobby__server-icon lobby__server-icon--add" title="Create room"
                  @click=${() => this.renderRoot.querySelector<HTMLElement>(".lobby__create-input")?.focus()}
                >+</button>
              </div>
            </div>

            <!-- Direct Messages -->
            <div class="lobby__card lobby__card--dm">
              <h3 class="lobby__card-title">Direct Messages</h3>
              <div class="lobby__dm-list">
                ${this.rooms.length === 0 && !this.isLoadingRooms
                  ? html`<p class="lobby__empty">No rooms yet</p>`
                  : repeat(
                      this.rooms.slice(0, 6),
                      (r) => r.id,
                      (r) => {
                        const unread = this.unreadByRoom[r.id] ?? 0;
                        const preview = this.renderLastMessagePreview(r.id);
                        return html`
                          <div
                            class="lobby__dm-item ${this.selectedRoomId === r.id ? "lobby__dm-item--selected" : ""}"
                            @click=${() => { this.selectedRoomId = r.id; }}
                          >
                            <div class="lobby__dm-avatar">${this.getRoomInitial(r.name)}</div>
                            <div class="lobby__dm-info">
                              <div class="lobby__dm-name">${r.name}</div>
                              <div class="lobby__dm-preview">${preview}</div>
                            </div>
                            ${unread > 0 && this.username.trim()
                              ? html`<span class="lobby__unread-badge">${unread}</span>`
                              : html`<span class="lobby__dm-dot"></span>`}
                          </div>
                        `;
                      }
                    )}
              </div>
            </div>
          </aside>

          <!-- Main content -->
          <main class="lobby__main">

            <!-- Create Room banner -->
            <lobby-create-room
              .error=${this.error}
              @create-room=${(e: CustomEvent) => this.handleCreateRoomFromChild(e.detail)}
            ></lobby-create-room>

            <!-- Trending Now -->
            <section class="lobby__section">
              <h3 class="lobby__section-title">Trending Now</h3>
              <div class="lobby__trending">
                ${this.renderTrendingRooms()}
              </div>
            </section>

            <!-- Room Finder -->
            <section class="lobby__section">
              <div class="lobby__finder-header">
                <h3 class="lobby__section-title" style="margin:0">Room Finder</h3>
                <button
                  class="lobby__refresh-btn"
                  @click=${this.loadRooms}
                  ?disabled=${this.isLoadingRooms}
                >
                  ${this.isLoadingRooms
                    ? html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
                    : html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Refresh`}
                </button>
              </div>

              <div class="lobby__search-row">
                <div class="lobby__search-wrap">
                  <svg class="lobby__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    class="lobby__input lobby__search-input"
                    type="text"
                    placeholder="Search..."
                    .value=${this.searchQuery}
                    @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>

              <!-- Category filters -->
              <div class="lobby__categories">
                ${CATEGORIES.map((cat) => html`
                  <button
                    class="lobby__category-btn ${this.activeCategory === cat ? "lobby__category-btn--active" : ""}"
                    @click=${() => (this.activeCategory = cat)}
                  >${cat}</button>
                `)}
              </div>

              <div class="lobby__table-wrapper">
                <table class="lobby__table">
                  <thead>
                    <tr>
                      <th>Room Name</th>
                      <th>Participants</th>
                      <th>Status</th>
                      <th>Join Action</th>
                    </tr>
                  </thead>
                  <tbody>${this.renderRoomFinderTable()}</tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    `;
  }
}
