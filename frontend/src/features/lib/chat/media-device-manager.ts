/**
 * MediaDeviceManager — Phase 2: Hardware Isolation
 *
 * Single responsibility: request hardware permissions and return MediaStreams.
 * This class knows nothing about WebRTC, signaling, or the DOM.
 */

export class MicrophoneDeniedError extends Error {
  constructor() {
    super("Microphone access was denied or is unavailable.");
    this.name = "MicrophoneDeniedError";
  }
}

export class ScreenShareDeniedError extends Error {
  constructor() {
    super("Screen share permission was denied.");
    this.name = "ScreenShareDeniedError";
  }
}

export class MediaDeviceManager {
  /**
   * Request microphone access.
   * @throws {MicrophoneDeniedError} if the user denies permission or no device is found.
   */
  async getMicrophoneStream(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      // NotAllowedError = user denied; NotFoundError = no mic present
      if (
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "NotFoundError")
      ) {
        throw new MicrophoneDeniedError();
      }
      throw err;
    }
  }

  /**
   * Request screen capture access.
   * @returns The display MediaStream, or null if the user cancelled.
   * @throws if a non-permission error occurs (e.g. hardware fault).
   */
  async getDisplayStream(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: { width: { max: 1920 }, height: { max: 1080 }, frameRate: { max: 30 } },
      } as DisplayMediaStreamOptions);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        // User dismissed the picker or denied — not an error, just null.
        return null;
      }
      throw err;
    }
  }
}

/** Singleton — one instance shared across the app. */
export const mediaDeviceManager = new MediaDeviceManager();
