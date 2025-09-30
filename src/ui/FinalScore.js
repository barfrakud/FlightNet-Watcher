export class FinalScore {
  constructor(root, options = {}) {
    this.root = root;
    this.onRestart = options.onRestart || (() => {});
    this.element = null;
    this.isVisible = false;
  }

  show({ callsign, score, stage, topScores }) {
    if (this.isVisible) return;
    
    this.element = document.createElement('div');
    this.element.className = 'final-score';
    
    const topScoresHtml = topScores && topScores.length > 0
      ? topScores.map((entry, index) => `
          <div class="final-score__entry ${entry.callsign === callsign && entry.score === score ? 'final-score__entry--highlight' : ''}">
            <span class="final-score__rank">${index + 1}.</span>
            <span class="final-score__callsign">${entry.callsign}</span>
            <span class="final-score__points">${entry.score} pts</span>
          </div>
        `).join('')
      : '<p class="final-score__empty">No scores yet</p>';

    this.element.innerHTML = `
      <div class="final-score__content">
        <h2 class="final-score__title">Game Completed!</h2>
        <div class="final-score__player">
          <p class="final-score__player-callsign">${callsign}</p>
          <p class="final-score__player-score">${score} points</p>
          <p class="final-score__player-stage">Completed ${stage} stage${stage > 1 ? 's' : ''}</p>
        </div>
        <div class="final-score__leaderboard">
          <h3 class="final-score__leaderboard-title">Top Scores</h3>
          <div class="final-score__list">
            ${topScoresHtml}
          </div>
        </div>
        <button class="final-score__button">Play Again</button>
      </div>
    `;

    const button = this.element.querySelector('.final-score__button');
    button.addEventListener('click', () => {
      this.hide();
      this.onRestart();
    });

    this.root.appendChild(this.element);
    this.isVisible = true;
  }

  hide() {
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.element = null;
    this.isVisible = false;
  }

  destroy() {
    this.hide();
  }
}
