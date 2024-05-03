import { controller, target } from "@github/catalyst";

@controller
class HomeLayoutElement extends HTMLElement {
  @target content: HTMLElement;
  @target collapseLabel: HTMLLabelElement;
  @target collapseInput: HTMLInputElement;

  toggleText() {
    setTimeout(() => {
      this.collapseLabel.textContent = this.collapseInput.checked
        ? "•close"
        : "⊙open";
    }, 0);
  }

  connectedCallback() {
    this.toggleText();
  }

  addZone() {
    const count = this.content.childElementCount;
    this.content.insertAdjacentHTML(
      "beforeend",
      `<div class="vote-card">
      <div class="vote-card__header">
        <h1>Votes for:</h1><h1 contenteditable><h1 data-targets="drop-zone.count"></h1>
      </div>
      <div
        data-zone-id="${count + 1}"
        class="dropzone" 
        data-target="drop-zone.zone"
        data-targets="drop-zone.zones" 
        data-action="dragover:drop-zone#handleDragOver 
                      drop:drop-zone#handleDrop 
                      dragstart:drop-zone#handleDragStart"
        style="position: relative">
      </div>
    </div>`
    );
  }
}
