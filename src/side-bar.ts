import { controller, target, targets } from "@github/catalyst";

@controller
class SideBarElement extends HTMLElement {
  @target survivorInput: HTMLInputElement;
  @target survivorList: HTMLUListElement;
  #players: { player: string; id: number }[] = [];
  counter = 0;

  addPlayer(player: string) {
    this.#players.push({ player, id: this.counter });
    this.counter++;
  }

  removePlayer(e: PointerEvent) {
    const buttonTarget = e.target as HTMLButtonElement;
    if (buttonTarget.nodeName != "BUTTON") {
      return;
    }
    // cut player out of list
    const index = this.#players.findIndex(
      (el) => String(el.id) == String(buttonTarget.dataset.playerId)
    );
    const [player] = this.#players.splice(index, 1);

    // remove all instances of player from DOM
    //@ts-ignore
    const allInstances = document.querySelectorAll(
      `[data-player-id='${player.id}']`
    );
    Array.from(allInstances).forEach((a) => a.remove());
    this.updateList();

    // clear and refocus input
    this.survivorInput.value = "";
    this.survivorInput.focus();

    // this doesnt work to update count in dropzones...
    this.dispatchEvent(new CustomEvent("updatecount"));
  }

  handleDragStart(e: DragEvent) {
    if (!e.dataTransfer) return;

    const span = e.target as HTMLSpanElement;
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: span.dataset.playerId,
        name: span.dataset.playerName,
      })
    );
  }

  updateList() {
    this.survivorList.replaceChildren();
    const list = this.#players.map((p) => {
      return `<li 
        class="player" 
        draggable="true"
        data-player-id="${p.id}"
        data-player-name="${p.player}">
        <button data-player-id="${p.id}">
          x
        </button>
        ${p.player}
      </li>`;
    });
    this.survivorList.insertAdjacentHTML("beforeend", list.join(""));
  }

  addSurvivor(e: KeyboardEvent) {
    console.log(this);
    if (e.key != "Enter") {
      return;
    }

    this.addPlayer(this.survivorInput.value);
    this.updateList();
    this.survivorInput.value = "";
    this.survivorInput.focus();
  }
  connectedCallback() {
    console.log("heyyyyy");
  }
}
