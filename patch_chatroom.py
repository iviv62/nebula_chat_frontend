import re

with open('frontend/src/components/chat/chat-room.ts', 'r') as f:
    content = f.read()

# Add _voiceDuration state
content = re.sub(
    r'(@state\(\) private _voiceState: "idle" \| "calling" \| "active" \| "error" = "idle";)',
    r'\1\n  @state() private _voiceDuration = 0;',
    content
)

# Add onCallDuration handler
content = re.sub(
    r'(onConnectionMetrics: \(metrics\) => {\n          this\._connectionMetrics = metrics;\n        },)',
    r'\1\n        onCallDuration: (duration) => {\n          this._voiceDuration = duration;\n        },',
    content
)

# Reset _voiceDuration
content = re.sub(
    r'(private resetVoiceUiState\(\) {\n    this\._voiceParticipants = \[\];)',
    r'\1\n    this._voiceDuration = 0;',
    content
)

# Pass to chat-active-call
content = re.sub(
    r'(<chat-active-call\n                  \.callState=\$\{this\._voiceState\}\n                  \.roomName=\$\{this\.roomName\}\n                  \.username=\$\{this\.username\})',
    r'\1\n                  .callDuration=${this._voiceDuration}',
    content
)

# Pass to chat-voice-bar
content = re.sub(
    r'(<chat-voice-bar\n                  \.state=\$\{this\._voiceState\}\n                  \.participants=\$\{this\._voiceParticipants\})',
    r'\1\n                  .callDuration=${this._voiceDuration}',
    content
)

with open('frontend/src/components/chat/chat-room.ts', 'w') as f:
    f.write(content)
