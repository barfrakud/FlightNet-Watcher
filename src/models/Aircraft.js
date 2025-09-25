const COLLISION_TIMEOUT_MS = 5000;
const AVOIDANCE_RADIUS = 50;
const COLLISION_RADIUS = 5;

export class Aircraft {
  constructor(bounds) {
    this.bounds = { ...bounds };
    this.x = Math.random() * this.bounds.width;
    this.y = Math.random() * this.bounds.height;
    this.speed = this.#generateSpeed();
    this.direction = Math.random() * Math.PI * 2;
    this.icao = this.#generateICAO();
    this.altitude = Math.floor(Math.random() * 150 + 100) * 100;
    this.type = this.#generateAircraftType();
    this.avoidanceRadius = AVOIDANCE_RADIUS;
    this.collisionRadius = COLLISION_RADIUS;
    this.isColliding = false;
    this.collisionTimestamp = null;
  }

  update(mousePosition, bounds) {
    this.bounds = { ...bounds };
    this.#avoid(mousePosition);
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    this.#wrapWithinBounds();
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
    if (!this.isColliding || this.collisionTimestamp == null) {
      return false;
    }
    return timestamp - this.collisionTimestamp > COLLISION_TIMEOUT_MS;
  }

  draw(ctx) {
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

  #wrapWithinBounds() {
    const { width, height } = this.bounds;
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
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
