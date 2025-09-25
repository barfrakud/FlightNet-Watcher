import { Aircraft } from '../models/Aircraft.js';

export class TrafficManager {
  constructor({ maxAircraft = 10, spawnInterval = 1000 } = {}) {
    this.maxAircraft = maxAircraft;
    this.spawnInterval = spawnInterval;
    this.bounds = { width: 0, height: 0 };
    this.aircraft = [];
    this.lastSpawn = 0;
  }

  initialize(bounds) {
    this.bounds = { ...bounds };
    this.aircraft = Array.from({ length: this.maxAircraft }, () => new Aircraft(bounds));
    this.lastSpawn = performance.now();
  }

  setBounds(bounds) {
    this.bounds = { ...bounds };
  }

  update({ timestamp, mousePosition }) {
    if (!timestamp) {
      return;
    }

    if (timestamp - this.lastSpawn >= this.spawnInterval && this.aircraft.length < this.maxAircraft) {
      this.aircraft.push(new Aircraft(this.bounds));
      this.lastSpawn = timestamp;
    }

    for (let i = this.aircraft.length - 1; i >= 0; i -= 1) {
      const current = this.aircraft[i];
      current.update(mousePosition, this.bounds);
      current.isColliding = false;
    }

    for (let i = 0; i < this.aircraft.length; i += 1) {
      for (let j = i + 1; j < this.aircraft.length; j += 1) {
        const a = this.aircraft[i];
        const b = this.aircraft[j];
        if (a.checkCollision(b)) {
          a.markCollision(timestamp);
          b.markCollision(timestamp);
        }
      }
    }

    this.aircraft = this.aircraft.filter((plane) => !plane.shouldRemove(timestamp));
  }

  draw(ctx) {
    this.aircraft.forEach((plane) => {
      plane.draw(ctx);
    });
  }
}
