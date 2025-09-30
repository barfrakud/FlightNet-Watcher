import { Aircraft } from '../models/Aircraft.js';

export class TrafficManager {
  constructor({ maxAircraft = 10, spawnInterval = 10000 } = {}) {
    this.maxAircraft = maxAircraft;
    this.spawnInterval = spawnInterval;
    this.bounds = { width: 0, height: 0 };
    this.aircraft = [];
    this.lastSpawn = 0;
    this.runway = null;
    this.runwayActive = false;
    this.gameStartTime = null;
    this.aircraftSpawned = 0;
    this.currentStage = 1;
    this.stageAircraftLimit = Infinity;
    this.stageComplete = false;
    this.activeRunwayDirection = '27';
    this.demoMode = true;
  }

  initialize(bounds) {
    this.bounds = { ...bounds };
    this.aircraft = [];
    this.lastSpawn = performance.now();
    this.gameStartTime = performance.now();
    this.aircraftSpawned = 0;
  }

  startStage(stageNumber) {
    this.currentStage = stageNumber;
    this.stageAircraftLimit = 0 + stageNumber;
    this.aircraftSpawned = 0;
    this.aircraft = [];
    this.stageComplete = false;
    this.lastSpawn = null;
    this.demoMode = false;
  }

  setActiveRunway(direction) {
    this.activeRunwayDirection = direction;
  }

  setBounds(bounds) {
    this.bounds = { ...bounds };
  }

  update({ timestamp, mousePosition, runway }) {
    if (!timestamp) {
      return { landed: 0, score: 0 };
    }

    this.runway = runway ?? null;
    this.runwayActive = Boolean(runway);

    if (this.demoMode) {
      const targetAircraft = 10;
      if (this.aircraft.length < targetAircraft) {
        if (this.lastSpawn === null || timestamp - this.lastSpawn >= 2000) {
          const newAircraft = this._createAircraft();
          this.aircraft.push(newAircraft);
          this.lastSpawn = timestamp;
        }
      }
    } else {
      const canSpawn = this.aircraftSpawned < this.stageAircraftLimit;
      if (canSpawn) {
        if (this.lastSpawn === null) {
          this.lastSpawn = timestamp;
        } else if (timestamp - this.lastSpawn >= this.spawnInterval) {
          const newAircraft = this._createAircraft();
          this.aircraft.push(newAircraft);
          this.lastSpawn = timestamp;
          this.aircraftSpawned += 1;
        }
      }
    }

    if (this.aircraftSpawned >= this.stageAircraftLimit && this.aircraft.length === 0) {
      this.stageComplete = true;
    }

    let landedCount = 0;
    let missedCount = 0;
    let totalScore = 0;

    for (let i = this.aircraft.length - 1; i >= 0; i -= 1) {
      const current = this.aircraft[i];
      current.update(mousePosition, this.bounds, this.activeRunwayDirection, this.runway);
      current.isColliding = false;

      if (current.missed && !current.wasCountedAsMissed) {
        current.wasCountedAsMissed = true;
        missedCount += 1;
        totalScore -= 20;
        console.log(`Aircraft missed! Penalty: -20 points`);
      }

      if (this.runwayActive && this.runway && !current.landed) {
        if (current.isWithinRunway(this.runway) && !current.touchedDown) {
          const runwayStartX = this.runway.centerX - this.runway.halfLength;
          current.markLanded(timestamp, this.activeRunwayDirection, runwayStartX);
          landedCount += 1;
          const score = current.calculateLandingScore(this.bounds);
          const headingMath = (current.direction * 180 / Math.PI + 360) % 360;
          const heading = (headingMath + 90) % 360;
          const idealHeading = this.activeRunwayDirection === '27' ? 270 : 90;
          let deviation = Math.abs(heading - idealHeading);
          if (deviation > 180) deviation = 360 - deviation;
          console.log(`Aircraft landed: heading=${heading.toFixed(1)}° (compass), ideal=${idealHeading}°, deviation=${deviation.toFixed(1)}°, activeRunway=${this.activeRunwayDirection}, correctRunway=${current.landedOnCorrectRunway}, crossedThreshold=${current.crossedThreshold}, distance=${current.distanceTraveled.toFixed(0)}, score=${score}`);
          totalScore += score;
        }
      }
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
    return { landed: landedCount, score: totalScore };
  }

  draw(ctx) {
    this.aircraft.forEach((plane) => {
      plane.draw(ctx);
    });
  }

  _createAircraft() {
    const width = this.bounds.width;
    const height = this.bounds.height;
    const side = Math.floor(Math.random() * 4);
    let x, y, direction;

    let targetX, targetY;
    
    if (this.runway) {
      if (this.activeRunwayDirection === '27') {
        targetX = this.runway.centerX + this.runway.halfLength;
        targetY = this.runway.centerY;
      } else {
        targetX = this.runway.centerX - this.runway.halfLength;
        targetY = this.runway.centerY;
      }
    } else {
      targetX = width / 2;
      targetY = height / 2;
    }

    switch(side) {
      case 0:
        x = Math.random() * width;
        y = -50;
        direction = Math.atan2(targetY - y, targetX - x);
        break;
      case 1:
        x = width + 50;
        y = Math.random() * height;
        direction = Math.atan2(targetY - y, targetX - x);
        break;
      case 2:
        x = Math.random() * width;
        y = height + 50;
        direction = Math.atan2(targetY - y, targetX - x);
        break;
      default:
        x = -50;
        y = Math.random() * height;
        direction = Math.atan2(targetY - y, targetX - x);
        break;
    }

    return new Aircraft(this.bounds, {
      x,
      y,
      direction,
      speed: 0.15 + Math.random() * 0.1,
      altitude: 6000 + Math.floor(Math.random() * 3000),
    });
  }
}
