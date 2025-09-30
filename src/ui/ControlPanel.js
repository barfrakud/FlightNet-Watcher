const SCORE_PLACEHOLDER = '—';

export class ControlPanel {
  constructor(root) {
    this.root = root;
    this.element = document.createElement('div');
    this.element.className = 'control-panel';
    this.element.style.display = 'none';
    this.root.appendChild(this.element);

    this.statusSection = document.createElement('div');
    this.statusSection.className = 'control-panel__section control-panel__section--status';

    this.difficultyLabel = document.createElement('p');
    this.difficultyLabel.className = 'control-panel__text';
    this.playersLabel = document.createElement('p');
    this.playersLabel.className = 'control-panel__text';
    this.flightsLabel = document.createElement('p');
    this.flightsLabel.className = 'control-panel__text';

    this.statusSection.appendChild(this.difficultyLabel);
    this.statusSection.appendChild(this.playersLabel);
    this.statusSection.appendChild(this.flightsLabel);

    this.scoreboardSection = document.createElement('div');
    this.scoreboardSection.className = 'control-panel__section control-panel__section--scoreboard';

    const scoreboardTitle = document.createElement('h3');
    scoreboardTitle.className = 'control-panel__heading';
    scoreboardTitle.textContent = 'Top 5';

    this.scoreList = document.createElement('ol');
    this.scoreList.className = 'control-panel__list';
    this.scoreList.setAttribute('start', '1');

    this.scoreboardSection.appendChild(scoreboardTitle);
    this.scoreboardSection.appendChild(this.scoreList);

    this.element.appendChild(this.statusSection);
    this.element.appendChild(this.scoreboardSection);

    this.update({});
  }

  update({ difficulty, playerSlots, activeFlights, topScores }) {
    const difficultyLabel = difficulty ? difficulty : 'unknown';
    const usedSlots = playerSlots?.used ?? 0;
    const maxSlots = playerSlots?.max ?? 1;
    const flights = Number.isFinite(activeFlights) ? activeFlights : 0;

    this.difficultyLabel.textContent = `Difficulty: ${difficultyLabel}`;
    this.playersLabel.textContent = `Players: ${usedSlots} / ${maxSlots}`;
    this.flightsLabel.textContent = `Active flights: ${flights}`;

    this.#renderScores(topScores);
  }

  destroy() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  #renderScores(scores) {
    const entries = Array.isArray(scores) ? scores : [];
    this.scoreList.innerHTML = '';

    if (entries.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'control-panel__list-item control-panel__list-item--empty';
      emptyItem.textContent = 'No scores yet';
      this.scoreList.appendChild(emptyItem);
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'control-panel__list-item';
      const score = Number.isFinite(entry.score) ? entry.score : SCORE_PLACEHOLDER;
      const callsign = entry.callsign ?? 'ANON';
      item.textContent = `${callsign} — ${score}`;
      this.scoreList.appendChild(item);
    });
  }

  show() {
    this.element.style.display = '';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
