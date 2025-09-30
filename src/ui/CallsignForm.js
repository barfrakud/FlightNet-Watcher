export class CallsignForm {
  constructor(root, { onSubmit } = {}) {
    this.root = root;
    this.onSubmit = typeof onSubmit === 'function' ? onSubmit : null;

    this.element = document.createElement('form');
    this.element.className = 'callsign-form';

    const label = document.createElement('label');
    label.className = 'callsign-form__label';
    label.textContent = 'Callsign:';
    label.setAttribute('for', 'callsign-input');

    this.input = document.createElement('input');
    this.input.id = 'callsign-input';
    this.input.name = 'callsign';
    this.input.className = 'callsign-form__input';
    this.input.type = 'text';
    this.input.placeholder = 'Podaj callsign';
    this.input.required = true;
    this.input.minLength = 2;
    this.input.maxLength = 12;

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className = 'callsign-form__button';
    this.submitButton.textContent = 'Rozpocznij grę';

    this.element.appendChild(label);
    this.element.appendChild(this.input);
    this.element.appendChild(this.submitButton);

    this.element.addEventListener('submit', (event) => {
      event.preventDefault();
      const callsign = this.input.value.trim();
      if (!callsign) {
        return;
      }
      if (this.onSubmit) {
        this.onSubmit({ callsign });
      }
      this.input.value = '';
    });

    this.root.appendChild(this.element);
    this.setVisible(true);
  }

  destroy() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  setVisible(isVisible) {
    this.element.style.display = isVisible ? 'flex' : 'none';
    if (isVisible) {
      requestAnimationFrame(() => this.input.focus());
    }
  }
}
