export class PlayerManager {
  constructor({ maxPlayers = 1, activePlayers = [] } = {}) {
    this.maxPlayers = Number.isInteger(maxPlayers) && maxPlayers > 0 ? maxPlayers : 1;
    this.activePlayers = new Map();

    (Array.isArray(activePlayers) ? activePlayers : []).forEach((player) => {
      if (player?.id) {
        this.activePlayers.set(player.id, {
          id: player.id,
          callsign: player.callsign ?? null,
          joinedAt: player.joinedAt ?? Date.now(),
          metadata: player.metadata ?? {},
        });
      }
    });
  }

  setMaxPlayers(limit) {
    if (!Number.isInteger(limit) || limit <= 0) {
      return this.maxPlayers;
    }
    this.maxPlayers = limit;
    this._enforceLimit();
    return this.maxPlayers;
  }

  getMaxPlayers() {
    return this.maxPlayers;
  }

  isSlotAvailable() {
    return this.activePlayers.size < this.maxPlayers;
  }

  joinPlayer({ id, callsign, metadata } = {}) {
    if (!id) {
      throw new Error('Player must have an id');
    }
    if (!this.isSlotAvailable()) {
      return null;
    }
    const player = {
      id,
      callsign: typeof callsign === 'string' ? callsign.trim() : null,
      joinedAt: Date.now(),
      metadata: metadata ?? {},
    };
    this.activePlayers.set(player.id, player);
    return { ...player };
  }

  leavePlayer(id) {
    if (!id) {
      return false;
    }
    return this.activePlayers.delete(id);
  }

  updatePlayer(id, updates = {}) {
    if (!this.activePlayers.has(id)) {
      return null;
    }
    const existing = this.activePlayers.get(id);
    const updated = {
      ...existing,
      ...updates,
    };
    this.activePlayers.set(id, updated);
    return { ...updated };
  }

  listPlayers() {
    return Array.from(this.activePlayers.values()).map((player) => ({ ...player }));
  }

  reset() {
    this.activePlayers.clear();
  }

  _enforceLimit() {
    while (this.activePlayers.size > this.maxPlayers) {
      const oldestPlayer = Array.from(this.activePlayers.values())
        .sort((a, b) => a.joinedAt - b.joinedAt)[0];
      if (!oldestPlayer) {
        break;
      }
      this.activePlayers.delete(oldestPlayer.id);
    }
  }
}
