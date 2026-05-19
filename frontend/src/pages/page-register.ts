import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { ThemeController } from "../features/lib/theme/theme-controller";
import { styles } from "./page-register.styles";

@customElement("page-register")
export class PageRegister extends LitElement {
  static styles = styles;

  // ThemeController is instantiated purely for its side effects:
  // it syncs data-theme on the host element and reacts to system preference
  // changes. No reference is needed after construction.
  constructor() {
    super();
    void new ThemeController(this);
  }

  render() {
    return html`
      <div class="register-page">
        <slot></slot>
      </div>
    `;
  }
}
