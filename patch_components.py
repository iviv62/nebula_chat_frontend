import re

# Update chat-active-call.ts
with open('frontend/src/components/chat/chat-active-call.ts', 'r') as f:
    content = f.read()

# Add callDuration property
content = re.sub(
    r'(@property\(\{ type: Object \}\) connectionMetrics: ConnectionMetrics \| null = null;)',
    r'\1\n  @property({ type: Number }) callDuration = 0;',
    content
)

# Update startTimer
content = re.sub(
    r'(this\.callStartTime = Date\.now\(\);)',
    r'this.callStartTime = Date.now() - this.callDuration * 1000;',
    content
)

# Add logic to updated() for callDuration change
content = re.sub(
    r'(if \(changedProperties\.has\("callState"\)\) \{)',
    r'if (changedProperties.has("callDuration") && this.callState === "active") {\n      this.callStartTime = Date.now() - this.callDuration * 1000;\n      const diff = this.callDuration;\n      const minutes = String(Math.floor(diff / 60)).padStart(2, "0");\n      const seconds = String(diff % 60).padStart(2, "0");\n      this.timer = `${minutes}:${seconds}`;\n    }\n\n    \1',
    content
)

with open('frontend/src/components/chat/chat-active-call.ts', 'w') as f:
    f.write(content)

# Update chat-voice-bar.ts
with open('frontend/src/components/chat/chat-voice-bar.ts', 'r') as f:
    content = f.read()

# Add callDuration property
content = re.sub(
    r'(@property\(\{ type: Boolean \}\) isMuted = false;)',
    r'\1\n  @property({ type: Number }) callDuration = 0;',
    content
)

# Update startTimer
content = re.sub(
    r'(this\.callStartTime = Date\.now\(\);)',
    r'this.callStartTime = Date.now() - this.callDuration * 1000;',
    content
)

# Add logic to updated() for callDuration change
content = re.sub(
    r'(if \(changedProperties\.has\("state"\)\) \{)',
    r'if (changedProperties.has("callDuration") && this.state === "active") {\n      this.callStartTime = Date.now() - this.callDuration * 1000;\n      const diff = this.callDuration;\n      const minutes = String(Math.floor(diff / 60)).padStart(2, "0");\n      const seconds = String(diff % 60).padStart(2, "0");\n      this.timer = `${minutes}:${seconds}`;\n    }\n\n    \1',
    content
)

with open('frontend/src/components/chat/chat-voice-bar.ts', 'w') as f:
    f.write(content)
