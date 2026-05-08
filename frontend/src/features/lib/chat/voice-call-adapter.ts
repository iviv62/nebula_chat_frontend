export type VoiceOffer = { sdp: string; type: RTCSdpType };
export type VoiceAnswer = { peer_id: string; sdp: string; type: RTCSdpType; participants?: { peer_id: string; username: string }[] };

// ── Domain type: the only shape the rest of the app sees ──────────────────
export type VoiceEvent =
  | { kind: "call_started"; peerId: string; username: string; room: string }
  | { kind: "call_ended"; peerId: string; username: string; room: string }
  | { kind: "call_error"; peerId: string; username: string; room: string }
  | { kind: "peer_joined"; peerId: string; username: string; room: string; participants: { peer_id: string; username: string }[] }
  | { kind: "ice_candidate"; peerId: string; room: string; candidate: RTCIceCandidateInit };

// ── Extractor (same pattern as extractPresenceUpdate / extractReactionUpdate) ──
export function extractVoiceEvent(payload: unknown): VoiceEvent | null {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (p["type"] !== "voice") return null;

  const event = String(p["event"] ?? "");
  const peerId = String(p["peer_id"] ?? "");
  const username = String(p["username"] ?? "");
  const room = String(p["room"] ?? "");

  if (event === "call_started" || event === "call_ended" || event === "call_error") {
    return { kind: event as "call_started" | "call_ended" | "call_error", peerId, username, room };
  } else if (event === "peer_joined") {
    return {
      kind: "peer_joined",
      peerId,
      username,
      room,
      participants: Array.isArray(p["participants"]) ? p["participants"] as { peer_id: string; username: string }[] : [],
    };
  } else if (event === "ice_candidate") {
    return {
      kind: "ice_candidate",
      peerId,
      room,
      candidate: p["candidate"] as RTCIceCandidateInit,
    };
  }

  return null;
}

// ── WebRTC adapter — wraps RTCPeerConnection lifecycle ────────────────────
export type VoiceCallAdapterOptions = {
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
};

export class VoiceCallAdapter {
  private pc: RTCPeerConnection | null = null;
  private stream: MediaStream | null = null;
  private iceQueue: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet = false;

  async openConnection(options?: VoiceCallAdapterOptions): Promise<void> {
    this.cleanupAudioElements();
    this.iceQueue = [];
    this.isRemoteDescriptionSet = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
    } catch (error) {
      throw new Error("Microphone access denied or unavailable.", { cause: error });
    }

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.pc.ontrack = (event: RTCTrackEvent) => {
      for (const stream of event.streams) {
        if (document.querySelector(`audio[data-stream="${stream.id}"]`)) continue;

        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.dataset["stream"] = stream.id;
        audio.srcObject = stream;
        audio.style.display = "none";
        document.body.appendChild(audio);

        stream.getAudioTracks().forEach((track) => {
          track.onended = () => audio.remove();
        });
      }
    };

    this.pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        options?.onIceCandidate?.(event.candidate.toJSON());
      }
    };

    for (const track of this.stream.getTracks()) {
      this.pc.addTrack(track, this.stream);
    }
  }

  async createOffer(): Promise<VoiceOffer> {
    if (!this.pc) throw new Error("Peer connection is not initialized.");

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    const localDescription = this.pc.localDescription;
    if (!localDescription?.sdp) {
      throw new Error("Local description was not created.");
    }

    return {
      sdp: localDescription.sdp,
      type: localDescription.type,
    };
  }

  async applyAnswer(answer: VoiceAnswer): Promise<void> {
    if (!this.pc) throw new Error("Peer connection is not initialized.");

    await this.pc.setRemoteDescription(answer as RTCSessionDescriptionInit);
    this.isRemoteDescriptionSet = true;

    for (const candidate of this.iceQueue) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.iceQueue = [];
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) return;

    if (!this.isRemoteDescriptionSet) {
      this.iceQueue.push(candidate);
      return;
    }

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  onConnectionFailed(cb: () => void): void {
    if (!this.pc) return;
    this.pc.onconnectionstatechange = () => {
      const s = this.pc?.connectionState;
      if (s === "failed" || s === "closed") cb();
    };
  }

  setMuted(muted: boolean): void {
    if (!this.stream) return;
    for (const track of this.stream.getAudioTracks()) {
      track.enabled = !muted;
    }
  }

  setVolume(volume: number): void {
    document.querySelectorAll("audio[data-stream]").forEach((el) => {
      (el as HTMLAudioElement).volume = Math.max(0, Math.min(1, volume / 100));
    });
  }

  close(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.pc?.close();
    this.cleanupAudioElements();
    this.stream = null;
    this.pc = null;
    this.iceQueue = [];
    this.isRemoteDescriptionSet = false;
  }

  private cleanupAudioElements(): void {
    document.querySelectorAll("audio[data-stream]").forEach((el) => el.remove());
  }
}
