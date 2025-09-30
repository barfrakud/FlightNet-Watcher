export class HUD {
  constructor(root) {
    this.root = root;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.root.appendChild(this.element);

    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'hud__score';
    this.stageElement = document.createElement('div');
    this.stageElement.className = 'hud__stage';
    this.timerElement = document.createElement('div');
    this.timerElement.className = 'hud__timer';
    this.runwayElement = document.createElement('div');
    this.runwayElement.className = 'hud__runway';
    this.aircraftElement = document.createElement('div');
    this.aircraftElement.className = 'hud__aircraft';

    this.element.appendChild(this.scoreElement);
    this.element.appendChild(this.stageElement);
    this.element.appendChild(this.timerElement);
    this.element.appendChild(this.runwayElement);
    this.element.appendChild(this.aircraftElement);

    this.reset();
  }

  update({ score, stage, elapsedMs, activeRunway, aircraftSpawned, aircraftTotal }) {
    if (Number.isFinite(score)) {
      this.scoreElement.textContent = `Score: ${score}`;
    }
    if (stage) {
      this.stageElement.textContent = `Stage: ${stage}`;
    }
    if (Number.isFinite(elapsedMs)) {
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      this.timerElement.textContent = `Time: ${minutes}:${seconds}`;
    }
    if (activeRunway) {
      this.runwayElement.textContent = `Active RWY: ${activeRunway}`;
    }
    if (Number.isFinite(aircraftSpawned) && Number.isFinite(aircraftTotal)) {
      this.aircraftElement.textContent = `Aircraft: ${aircraftSpawned}/${aircraftTotal}`;
    }
  }

  reset() {
    this.update({ score: 0, stage: 1, elapsedMs: 0, activeRunway: '--' });
  }

  destroy() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}
