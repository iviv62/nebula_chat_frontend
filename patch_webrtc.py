import re

with open('frontend/src/features/lib/chat/webrtc-adapter.ts', 'r') as f:
    content = f.read()

# Fix string quoting
content = content.replace("this.events.onCallDuration?.(msg[\'duration\']);", "this.events.onCallDuration?.(msg['duration']);")

with open('frontend/src/features/lib/chat/webrtc-adapter.ts', 'w') as f:
    f.write(content)
