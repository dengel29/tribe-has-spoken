import { controller, target, targets } from "@github/catalyst";

@controller
class DropZoneElement extends HTMLElement {
  @target content: HTMLDivElement;
  @targets count: HTMLHeadingElement[];
  @target zone: HTMLDivElement;
  @targets zones: HTMLDivElement[];

  connectedCallback() {
    this.attachObserverToAllZones();
    this.attachOuterObserver();
  }

  handleDragOver(e: DragEvent) {
    if (!e.dataTransfer || !e.target) {
      e.preventDefault();
      return;
    }

    const dropzone = e.target as HTMLDivElement;

    const dragEventData = JSON.parse(e.dataTransfer?.getData("text/plain"));

    if (!dragEventData.originZoneId) {
      // if dragging from sidebar
      dropzone.classList.add("drop-highlight");
      e.preventDefault();
      return;
    }

    if (dragEventData.originZoneId === dropzone.dataset.zoneId) {
      // if dragging from dropzone over original dropzone
      e.preventDefault();
      return;
    } else {
      // if dragging from dropzone to new dropzone
      dropzone.classList.add("drop-highlight");
      e.preventDefault();
      return;
    }
  }

  handleDragLeave(e: DragEvent) {
    const div = e.target as HTMLDivElement;
    div.classList.remove("drop-highlight");
    e.preventDefault();
  }

  handleDragStart(e: DragEvent) {
    const playerEl = e.target as HTMLLIElement;
    if (
      !playerEl ||
      !playerEl.dataset.playerId ||
      !playerEl.parentElement ||
      !e.dataTransfer
    ) {
      return null;
    }

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: playerEl.dataset.playerId,
        name: playerEl.dataset.playerName,
        originZoneId: playerEl.parentElement.dataset.zoneId,
      })
    );
  }

  createDropzoneChild(e: DragEvent, name: string, id: string) {
    //@ts-ignore
    const rect = e.currentTarget.getBoundingClientRect();
    const coordinates = [e.pageX - rect.left, e.pageY - rect.top];
    const left = coordinates[0] - 10 + "px";
    const top = coordinates[1] - 10 + "px";
    const child = document.createElement("span");
    child.style.left = left;
    child.style.top = top;
    child.dataset.playerName = name;
    child.dataset.playerId = id;
    child.classList.add("dropzone__item");
    child.draggable = true;
    child.textContent = name;
    // const child = html`
    //   <span
    //     class="dropzone__item"
    //     draggable="true"
    //     data-player-id=${id}
    //     data-player-name=${name}
    //     style="left: ${left}; top: ${top}"
    //   >
    //     ${name}
    //   </span>
    // `;
    return child;
  }

  handleDrop(e: DragEvent) {
    const destZone = e.target as HTMLDivElement;

    if (!destZone?.dataset.zoneId || !e.dataTransfer) {
      return;
    }

    const { id, name, originZoneId } = JSON.parse(
      e.dataTransfer?.getData("text/plain")
    );
    const destZoneId = destZone?.dataset.zoneId;
    const child = this.createDropzoneChild(e, name, id);

    if (originZoneId && originZoneId === destZoneId) {
      // dropping within the same zone
      const removeTarget = destZone.querySelector(
        `[data-player-id='${id}']`
      ) as HTMLSpanElement;

      removeTarget.remove();
      destZone.appendChild(child);
    } else if (originZoneId && originZoneId !== destZoneId) {
      // dropping in a new zone
      const originZone = document.querySelector(
        `[data-zone-id='${originZoneId}']`
      ) as HTMLDivElement;
      const originPlayer = originZone.querySelector(`[data-player-id='${id}']`);
      originPlayer?.remove();
      destZone.appendChild(child);
    } else {
      // dragging from sidebar
      destZone.appendChild(child);
    }

    destZone.classList.remove("drop-highlight");
  }

  handleUpdateCount() {
    const co = this.zones.map((z) => z.querySelectorAll("span").length);
    this.count.forEach((c, i) => (c.innerText = String(co[i])));
  }

  attachObserverToAllZones() {
    const observationMethod = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        // log.textContent = `Mutation type: ${record.type}`;
        if (mutation.type === "childList") {
          console.log("child added or removed:", mutation.addedNodes);
          this.handleUpdateCount();
        }
      }
    };
    const observer = new MutationObserver(observationMethod);
    this.zones.forEach((zone) => {
      observer.observe(zone, { childList: true });
    });
  }

  attachObserverToOneZone(zone: Node) {
    console.log("firing attach");
    const observationMethod = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        // log.textContent = `Mutation type: ${record.type}`;
        if (mutation.type === "childList") {
          console.log("child added or removed:", mutation.addedNodes);
          this.handleUpdateCount();
        }
      }
    };
    const observer = new MutationObserver(observationMethod);

    //@ts-ignore
    observer.observe(zone.querySelector('[data-target="drop-zone.zone"]'), {
      childList: true,
    });
  }

  attachOuterObserver() {
    const observationMethod = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          console.log("child added or removed:", mutation.addedNodes);
          this.attachObserverToOneZone(mutation.addedNodes[0]);
        }
      }
    };

    const observer = new MutationObserver(observationMethod);
    observer.observe(this, { childList: true });
  }
}
