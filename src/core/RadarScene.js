import { TrafficManager } from '../services/TrafficManager.js';

const DEFAULT_BACKGROUND = '#001a2c';

export class RadarScene {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('RadarScene expects a HTMLCanvasElement');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      backgroundColor: options.backgroundColor ?? DEFAULT_BACKGROUND,
      maxAircraft: options.maxAircraft ?? 10,
      spawnInterval: options.spawnInterval ?? 1000,
    };

    this.mousePosition = null;
    this.running = false;
    this.frameRequest = null;

    this.trafficManager = new TrafficManager({
      maxAircraft: this.options.maxAircraft,
      spawnInterval: this.options.spawnInterval,
    });

    this._boundLoop = this._loop.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);

    this._configureCanvas();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
    window.removeEventListener('resize', this._handleResize);
    this.canvas.removeEventListener('mousemove', this._handleMouseMove);
  }

  _configureCanvas() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);
    this.canvas.addEventListener('mousemove', this._handleMouseMove);
    this.trafficManager.initialize(this._getBounds());
  }

  _handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  _loop(timestamp) {
    if (!this.running) {
      return;
    }

    const bounds = this._getBounds();
    this.trafficManager.setBounds(bounds);
    this.trafficManager.update({ timestamp, mousePosition: this.mousePosition });

    this._drawBackground();
    this.trafficManager.draw(this.ctx);

    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  _drawBackground() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    ctx.fillStyle = this.options.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY);

    ctx.strokeStyle = '#003300';
    for (let i = 1; i <= 5; i += 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius * i) / 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();
  }

  _getBounds() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
