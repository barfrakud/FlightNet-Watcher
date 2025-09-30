export class HUD {
  constructor(root, options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.style.display = 'none';
    this.root = root;
    this.root.appendChild(this.element);

    const title = document.createElement('h3');
    title.className = 'hud__title';
    title.textContent = 'Game Info';

    this.stageElement = document.createElement('div');
    this.stageElement.className = 'hud__item';
    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'hud__item';
    this.timerElement = document.createElement('div');
    this.timerElement.className = 'hud__item';
    this.runwayElement = document.createElement('div');
    this.runwayElement.className = 'hud__item';
    this.aircraftElement = document.createElement('div');
    this.aircraftElement.className = 'hud__item';

    this.element.appendChild(title);
    this.element.appendChild(this.stageElement);
    this.element.appendChild(this.scoreElement);
    this.element.appendChild(this.timerElement);
    this.element.appendChild(this.runwayElement);
    this.element.appendChild(this.aircraftElement);

    this.reset();
  }

  update({ score, stage, elapsedMs, activeRunway, aircraftAirborne, aircraftLanded }) {
    if (stage) {
      this.stageElement.textContent = `STAGE: ${stage}`;
    }
    if (Number.isFinite(score)) {
      this.scoreElement.textContent = `SCORE: ${score}`;
    }
    if (Number.isFinite(elapsedMs)) {
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      this.timerElement.textContent = `TIME: ${minutes}:${seconds}`;
    }
    if (activeRunway) {
      this.runwayElement.textContent = `ACTIVE RWY: ${activeRunway}`;
    }
    if (Number.isFinite(aircraftAirborne) && Number.isFinite(aircraftLanded)) {
      this.aircraftElement.textContent = `AIRCRAFT: ${aircraftAirborne}/${aircraftLanded}`;
    }
  }

  reset() {
    this.update({ score: 0, stage: 1, elapsedMs: 0, activeRunway: '--' });
  }

  show() {
    this.element.style.display = '';
  }

  hide() {
    this.element.style.display = 'none';
  }

  destroy() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
