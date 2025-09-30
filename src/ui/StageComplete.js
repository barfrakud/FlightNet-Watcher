export class StageComplete {
  constructor(root, options = {}) {
    this.root = root;
    this.onNextStage = options.onNextStage || (() => {});
    this.onEndGame = options.onEndGame || (() => {});
    this.element = null;
    this.isVisible = false;
  }

  show({ stage, score, totalScore }) {
    if (this.isVisible) return;
    
    this.element = document.createElement('div');
    this.element.className = 'stage-complete';
    this.element.innerHTML = `
      <div class="stage-complete__content">
        <h2 class="stage-complete__title">Stage ${stage} Complete!</h2>
        <div class="stage-complete__stats">
          <p class="stage-complete__stat">Stage Score: <span class="stage-complete__value">${score}</span></p>
          <p class="stage-complete__stat">Total Score: <span class="stage-complete__value">${totalScore}</span></p>
        </div>
        <div class="stage-complete__buttons">
          <button class="stage-complete__button stage-complete__button--next">Next Stage</button>
          <button class="stage-complete__button stage-complete__button--end">End Game</button>
        </div>
      </div>
    `;

    const nextButton = this.element.querySelector('.stage-complete__button--next');
    nextButton.addEventListener('click', () => {
      this.hide();
      this.onNextStage();
    });

    const endButton = this.element.querySelector('.stage-complete__button--end');
    endButton.addEventListener('click', () => {
      this.hide();
      this.onEndGame();
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
