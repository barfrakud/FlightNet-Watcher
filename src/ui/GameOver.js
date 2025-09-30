export class GameOver {
  constructor(root, options = {}) {
    this.root = root;
    this.onRestart = options.onRestart || (() => {});
    this.element = null;
    this.isVisible = false;
  }

  show({ score, stage }) {
    if (this.isVisible) return;
    
    this.element = document.createElement('div');
    this.element.className = 'game-over';
    this.element.innerHTML = `
      <div class="game-over__content">
        <h2 class="game-over__title">Game Over!</h2>
        <p class="game-over__message">Your score dropped below zero</p>
        <div class="game-over__stats">
          <p class="game-over__stat">Final Score: <span class="game-over__value">${score}</span></p>
          <p class="game-over__stat">Reached Stage: <span class="game-over__value">${stage}</span></p>
        </div>
        <button class="game-over__button">Restart Game</button>
      </div>
    `;

    const button = this.element.querySelector('.game-over__button');
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
