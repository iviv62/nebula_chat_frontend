import { VoiceCallAdapter, type VoiceAnswer, type VoiceOffer } from "./voice-call-adapter";
import { getApiBaseUrl } from "./chat-config";
import { fetchWithAuth } from "../http/fetch-interceptor";

/** Lifecycle state of a voice call. */
export type VoiceCallState = "idle" | "calling" | "active" | "error";

export type VoiceCallControllerOptions = {
  apiBase: string | undefined;
  wsBase: string | undefined;
  room: string;
  username: string;
  onStateChange: (state: VoiceCallState) => void;
  /** Called when a new local ICE candidate must be forwarded to the remote peer via WS signaling. */
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  /** Called with the full participant list after joining, and whenever it changes. */
  onParticipantsChange?: (participants: { peer_id: string; username: string }[]) => void;
  onScreenShareTrack?: (stream: MediaStream | null) => void;
};

/**
 * Orchestrates a WebRTC voice call using the server-offer pattern:
 * the backend creates the SDP offer via POST /voice/join, the client
 * answers via POST /voice/answer. Server-driven renegotiation is handled
 * via the "server_offer" WebSocket event → handleServerOffer().
 */
export class VoiceCallController {
  private adapter = new VoiceCallAdapter();
  private peerId: string | null = null;
  private currentRoom: string;
  private currentUsername: string;
  private starting = false;
  private screenShareInProgress = false;
  private pendingStopScreenShare = false;
  private stopPromise: Promise<void> | null = null;
  private readonly options: VoiceCallControllerOptions;

  constructor(options: VoiceCallControllerOptions) {
    this.options = options;
    this.currentRoom = options.room;
    this.currentUsername = options.username;
  }

  get isScreenSharing(): boolean {
    return this.adapter.isScreenSharing;
  }

  async handleRemoteIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.adapter.addIceCandidate(candidate);
  }

  updateIdentity(room: string, username: string): void {
    this.currentRoom = room;
    this.currentUsername = username;
  }

  /**
   * Join a voice call using the server-offer flow:
   * 1. POST /voice/join — server creates RTCPeerConnection and returns SDP offer
   * 2. Apply the offer locally and create an SDP answer
   * 3. POST /voice/answer — send answer back to server
   */
  async start(): Promise<void> {
    this.stopPromise = null;
    if (this.peerId || this.starting) return;
    this.starting = true;
    this.options.onStateChange("calling");

    try {
      await this.adapter.openConnection({
        onIceCandidate: this.options.onIceCandidate,
        onScreenShareTrack: this.options.onScreenShareTrack,
      });

      const base = getApiBaseUrl(this.options.apiBase, this.options.wsBase);

      // Step 1: ask server to join — it returns an SDP offer
      const joinRes = await fetchWithAuth(`${base}/voice/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: this.currentRoom,
          username: this.currentUsername,
        }),
      });

      if (!joinRes.ok) throw new Error(`Join rejected: ${joinRes.status}`);

      const joinData: VoiceAnswer = await joinRes.json();
      this.peerId = joinData.peer_id;

      // Step 2: apply server offer, create answer
      const answer = await this.adapter.applyOffer(joinData.sdp, joinData.type);

      // Step 3: send answer to server
      const answerRes = await fetchWithAuth(`${base}/voice/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peer_id: this.peerId,
          sdp: answer.sdp,
          type: answer.type,
        }),
      });

      if (!answerRes.ok) throw new Error(`Answer rejected: ${answerRes.status}`);

      // Seed participant list — prepend self if server omitted the caller
      const participants = joinData.participants ?? [];
      if (!participants.some(p => p.username === this.currentUsername)) {
        participants.unshift({ peer_id: this.peerId, username: this.currentUsername });
      }
      this.options.onParticipantsChange?.(participants);

      this.adapter.onConnectionFailed(() => void this.stop());
      this.options.onStateChange("active");
    } catch (err) {
      console.error("[VoiceCallController] start failed", err);
      this.adapter.close();
      this.options.onStateChange("error");
    } finally {
      this.starting = false;
    }
  }

  /**
   * Handle a server-initiated renegotiation offer ("server_offer" WS event).
   * Returns the SDP answer to be sent back via POST /voice/answer.
   */
  async handleServerOffer(sdp: string, sdpType: RTCSdpType): Promise<VoiceOffer> {
    return this.adapter.applyOffer(sdp, sdpType);
  }

  async startScreenShare(): Promise<void> {
    if (this.screenShareInProgress) return;
    if (this.adapter.isScreenSharing) return;
    if (!this.peerId) return;

    try {
      this.screenShareInProgress = true;

      let offer: VoiceOffer;
      try {
        offer = await this.adapter.startScreenShare();
      } catch (err) {
        this.adapter.abortScreenShare();
        if (err instanceof Error && err.name !== "NotAllowedError") {
          console.error("[VoiceCallController] screen capture failed", err);
        }
        return;
      }

      try {
        await this.renegotiateScreenShare(offer);
        this.options.onScreenShareTrack?.(this.adapter.getScreenStream());
      } catch (err) {
        console.error("[VoiceCallController] renegotiation failed, reverting", err);
        this.adapter.abortScreenShare();

        try {
          const restoreOffer = await this.adapter.createOffer();
          await this.renegotiateScreenShare(restoreOffer);
        } catch {
          void this.stop();
        }
      }
    } finally {
      this.screenShareInProgress = false;
      if (this.pendingStopScreenShare) {
        this.pendingStopScreenShare = false;
        void this.stopScreenShare();
      }
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.peerId) return;
    if (!this.adapter.isScreenSharing) return;

    if (this.screenShareInProgress) {
      this.pendingStopScreenShare = true;
      return;
    }

    this.screenShareInProgress = true;

    try {
      const offer = await this.adapter.stopScreenShare();

      try {
        await this.renegotiateScreenShare(offer);
        this.options.onScreenShareTrack?.(null);
      } catch (err) {
        console.error("[VoiceCallController] stop screen share renegotiation failed", err);
        this.options.onScreenShareTrack?.(null);
        void this.stop();
      }
    } finally {
      this.screenShareInProgress = false;
    }
  }

  async stop(): Promise<void> {
    if (this.stopPromise) return this.stopPromise;

    this.stopPromise = (async () => {
      const peerId = this.peerId;
      this.peerId = null;
      this.screenShareInProgress = false;
      this.pendingStopScreenShare = false;
      this.adapter.close();
      this.options.onStateChange("idle");
      this.options.onParticipantsChange?.([]);

      if (peerId) {
        const base = getApiBaseUrl(this.options.apiBase, this.options.wsBase);
        await fetchWithAuth(`${base}/voice/stop/${peerId}`, { method: "POST" }).catch((err) => {
          console.error("Failed to notify backend of call end:", err);
        });
      }
    })();

    await this.stopPromise;
  }

  setMuted(muted: boolean): void {
    this.adapter.setMuted(muted);
  }

  setVolume(volume: number): void {
    this.adapter.setVolume(volume);
  }

  /**
   * Screen share renegotiation: client-offer flow (P2P screen share signaling
   * is relayed via WebSocket, not HTTP — this only handles the audio SFU side).
   */
  private async renegotiateScreenShare(offer: VoiceOffer): Promise<void> {
    if (!this.peerId) return;

    this.adapter.resetRemoteDescriptionState();

    const base = getApiBaseUrl(this.options.apiBase, this.options.wsBase);
    const res = await fetchWithAuth(`${base}/voice/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peer_id: this.peerId,
        sdp: offer.sdp,
        type: offer.type,
      }),
    });

    if (!res.ok) throw new Error(`Screen share renegotiation rejected: ${res.status}`);

    const answer: VoiceAnswer = await res.json();
    await this.adapter.applyAnswer(answer);
  }
}
