const SCORE_PLACEHOLDER = '—';

export class ControlPanel {
  constructor(root) {
    this.root = root;
    this.element = document.createElement('div');
    this.element.className = 'control-panel';
    this.element.style.display = 'none';
    this.root.appendChild(this.element);

    const scoreboardTitle = document.createElement('h3');
    scoreboardTitle.className = 'control-panel__title';
    scoreboardTitle.textContent = 'Best Scores';

    this.scoreList = document.createElement('ul');
    this.scoreList.className = 'control-panel__list';

    this.element.appendChild(scoreboardTitle);
    this.element.appendChild(this.scoreList);
  }

  update({ topScores }) {
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
