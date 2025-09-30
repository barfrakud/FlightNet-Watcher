const COLLISION_TIMEOUT_MS = 5000;
const AVOIDANCE_RADIUS = 50;
const COLLISION_RADIUS = 5;

export class Aircraft {
  constructor(bounds, initialState = {}) {
    this.bounds = { ...bounds };
    this.x = initialState.x ?? Math.random() * this.bounds.width;
    this.y = initialState.y ?? Math.random() * this.bounds.height;
    this.speed = initialState.speed ?? this.#generateSpeed();
    this.direction = initialState.direction ?? Math.random() * Math.PI * 2;
    this.icao = initialState.icao ?? this.#generateICAO();
    this.altitude = initialState.altitude ?? Math.floor(Math.random() * 150 + 100) * 100;
    this.type = initialState.type ?? this.#generateAircraftType();
    this.avoidanceRadius = AVOIDANCE_RADIUS;
    this.collisionRadius = COLLISION_RADIUS;
    this.isColliding = false;
    this.collisionTimestamp = null;
    this.landed = false;
    this.landedTimestamp = null;
    this.touchedDown = false;
    this.approachTarget = initialState.approachTarget ?? null;
    this.distanceTraveled = 0;
    this.previousX = this.x;
    this.previousY = this.y;
    this.missed = false;
    this.wasCountedAsMissed = false;
  }

  update(mousePosition, bounds) {
    if (this.landed) {
      return;
    }
    this.bounds = { ...bounds };
    
    if (!this.touchedDown) {
      this.#avoid(mousePosition);
      const oldX = this.x;
      const oldY = this.y;
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
      
      const dx = this.x - oldX;
      const dy = this.y - oldY;
      this.distanceTraveled += Math.hypot(dx, dy);
      
      if (this.#isOutOfBounds()) {
        this.missed = true;
      }
    } else {
      this.speed = Math.max(this.speed * 0.95, 0);
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
      if (this.speed < 0.01) {
        this.landed = true;
      }
    }
  }

  checkCollision(otherAircraft) {
    const dx = this.x - otherAircraft.x;
    const dy = this.y - otherAircraft.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.collisionRadius + otherAircraft.collisionRadius);
  }

  markCollision(timestamp) {
    if (!this.isColliding) {
      this.collisionTimestamp = timestamp;
    }
    this.isColliding = true;
  }

  shouldRemove(timestamp) {
    if (this.landed || this.missed) {
      return true;
    }
    if (!this.isColliding || this.collisionTimestamp == null) {
      return false;
    }
    return timestamp - this.collisionTimestamp > COLLISION_TIMEOUT_MS;
  }

  draw(ctx) {
    if (this.landed) {
      return;
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.collisionRadius, 0, Math.PI * 2);
    ctx.strokeStyle = this.isColliding ? '#ff0000' : '#00ff00';
    ctx.stroke();

    const vectorLength = this.speed * 50;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.direction) * vectorLength,
      this.y + Math.sin(this.direction) * vectorLength
    );
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Courier New';
    ctx.fillText(`${this.icao}`, this.x + 10, this.y - 20);
    ctx.fillText(`${this.type}`, this.x + 10, this.y - 10);
    ctx.fillText(`SPD: ${Math.floor(this.speed * 1000)} kts`, this.x + 10, this.y);
    ctx.fillText(`ALT: ${this.altitude} ft`, this.x + 10, this.y + 10);
  }

  isWithinRunway(runway) {
    if (!runway) {
      return false;
    }
    const withinX = Math.abs(this.x - runway.centerX) <= runway.halfLength;
    const withinY = Math.abs(this.y - runway.centerY) <= runway.halfWidth;
    return withinX && withinY;
  }

  markLanded(timestamp, activeRunwayDirection, runwayStartX) {
    this.touchedDown = true;
    this.landedTimestamp = timestamp ?? Date.now();
    this.altitude = 0;
    this.landedOnCorrectRunway = this._checkRunwayDirection(activeRunwayDirection);
    this.runwayStartX = runwayStartX;
  }

  _checkRunwayDirection(activeRunway) {
    const heading = (this.direction * 180 / Math.PI + 360) % 360;
    if (activeRunway === '27') {
      return (heading >= 180 && heading <= 360) || heading === 0;
    } else if (activeRunway === '09') {
      return heading >= 0 && heading <= 180;
    }
    return false;
  }

  calculateLandingScore(bounds) {
    if (!this.landedOnCorrectRunway) {
      return 0;
    }
    
    const baseScore = 10;
    const minDistance = Math.min(bounds.width, bounds.height) * 0.3;
    const maxDistance = Math.min(bounds.width, bounds.height) * 2;
    
    const normalizedDistance = Math.max(0, Math.min(1, (this.distanceTraveled - minDistance) / (maxDistance - minDistance)));
    const distanceBonus = Math.round(10 * (1 - normalizedDistance));
    
    return baseScore + distanceBonus;
  }


  #avoid(mousePosition) {
    if (!mousePosition) {
      return;
    }
    const dx = this.x - mousePosition.x;
    const dy = this.y - mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0 && distance < this.avoidanceRadius) {
      const angleToMouse = Math.atan2(dy, dx);
      const avoidanceStrength = 0.1;
      this.direction = angleToMouse + avoidanceStrength * (Math.PI - distance / this.avoidanceRadius);
    }
  }

  #isOutOfBounds() {
    const margin = 100;
    const { width, height } = this.bounds;
    return this.x < -margin || this.x > width + margin || 
           this.y < -margin || this.y > height + margin;
  }

  #generateSpeed() {
    return Math.random() * 0.4 + 0.1;
  }

  #generateICAO() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return (
      'SP-' +
      chars[Math.floor(Math.random() * chars.length)] +
      chars[Math.floor(Math.random() * chars.length)] +
      chars[Math.floor(Math.random() * chars.length)]
    );
  }

  #generateAircraftType() {
    const commonTypes = [
      'A320', 'A321', 'B738', 'A319', 'E190',
      'A333', 'B772', 'B788', 'A359', 'B789',
      'DH8D', 'AT76', 'E170', 'CRJ9', 'A220'
    ];
    return commonTypes[Math.floor(Math.random() * commonTypes.length)];
  }
}
