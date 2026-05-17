## 2024-05-15 - ARIA Labels in Lit Components
**Learning:** In Lit components, dynamic properties for attributes like `aria-label` and `title` can safely be unquoted (e.g., `aria-label=${this.isMuted ? "Unmute" : "Mute"}`). Lit safely handles the data binding without causing rendering or XSS issues.
**Action:** When adding accessibility attributes to dynamic UI elements, use Lit's template bindings to toggle descriptive states (like "Mute" vs. "Unmute") based on the component's internal properties, ensuring screen readers receive accurate real-time context.

## 2024-05-16 - Contextual Tooltips for Disabled States
**Learning:** Found a pattern where disabled buttons lacked context for screen readers and sighted users. A static `title="Send"` on a disabled send button is confusing.
**Action:** When conditionally disabling action buttons, dynamically update both title and aria-label attributes to explain *why* the button is disabled (e.g., title=${isSubmitting ? "Sending..." : (canSubmit ? "Send" : "Cannot send empty message")}), rather than just showing it as unresponsive.

## 2024-05-16 - Standalone Input Accessibility
**Learning:** Several custom inputs (search bars, range sliders, compose textareas) across the app were missing `aria-label` attributes because they didn't have visual `<label>` elements, making them opaque to screen readers.
**Action:** Always add an explicit `aria-label` to any `<input>` or `<textarea>` that acts as a standalone control without an associated `<label>` element.
