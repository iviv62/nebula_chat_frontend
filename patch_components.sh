sed -i '/export class ChatNavSidebar extends LitElement {/a \ \ private themeCtrl = new ThemeController(this);' frontend/src/components/chat/chat-nav-sidebar.ts
sed -i '1i import { ThemeController } from "../../utils/theme-controller";' frontend/src/components/chat/chat-nav-sidebar.ts

sed -i '/export class ChatRoomUsers extends LitElement {/a \ \ private themeCtrl = new ThemeController(this);' frontend/src/components/chat/chat-room-users.ts
sed -i '1i import { ThemeController } from "../../utils/theme-controller";' frontend/src/components/chat/chat-room-users.ts
