export class StageComplete {
  constructor(root, options = {}) {
    this.root = root;
    this.onNextStage = options.onNextStage || (() => {});
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
        <button class="stage-complete__button">Next Stage</button>
      </div>
    `;

    const button = this.element.querySelector('.stage-complete__button');
    button.addEventListener('click', () => {
      this.hide();
      this.onNextStage();
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
