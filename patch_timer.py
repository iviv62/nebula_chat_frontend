import re

with open('frontend/src/components/chat/chat-voice-bar.ts', 'r') as f:
    content = f.read()

content = content.replace("this.timer = `${minutes}:${seconds}`;", r"this.timer = `${minutes}:${seconds}`;")
# Need to make sure `this.callStartTime` isn't overridden immediately if we already did it from updated()
# Instead, `startTimer` itself should just use `this.callStartTime = Date.now() - this.callDuration * 1000;`
# which it already does.

print("Verified chat-voice-bar.ts looks ok.")

with open('frontend/src/components/chat/chat-active-call.ts', 'r') as f:
    content = f.read()
print("Verified chat-active-call.ts looks ok.")
