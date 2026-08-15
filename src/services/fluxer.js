const API_BASE = 'https://api.canary.fluxer.app';
const GATEWAY_URL = 'wss://gateway.fluxer.app';

class FluxerAPI {
  constructor() {
    this.token = null;
    this.ws = null;
    this.sequence = null;
    this.sessionId = null;
    this.heartbeatInterval = null;
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, undelete: false, login_source: 'iOS' }),
    });
    const data = await res.json();
    if (data.token) {
      this.token = data.token;
      return data;
    }
    throw new Error(data.message || 'Login failed');
  }

  async loginWithToken(token) {
    const res = await fetch(`${API_BASE}/v1/users/@me`, {
      headers: { Authorization: token },
    });
    if (res.ok) {
      this.token = token;
      return await res.json();
    }
    throw new Error('Invalid token');
  }

  async fetchUser() {
    const res = await this._get('/v1/users/@me');
    return await res.json();
  }

  async fetchGuilds() {
    const res = await this._get('/v1/users/@me/guilds');
    return await res.json();
  }

  async fetchChannels(guildId) {
    const res = await this._get(`/v1/guilds/${guildId}/channels`);
    return await res.json();
  }

  async fetchMessages(channelId, limit = 50) {
    const res = await this._get(`/v1/channels/${channelId}/messages?limit=${limit}`);
    return await res.json();
  }

  async sendMessage(channelId, content) {
    const res = await this._post(`/v1/channels/${channelId}/messages`, { content });
    return await res.json();
  }

  connectGateway() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${GATEWAY_URL}/?v=9&encoding=json`);

      this.ws.onopen = () => {
        console.log('[Gateway] Connected');
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.op === 10) {
          this.startHeartbeat(msg.d.heartbeat_interval);
          this.identify();
        }

        if (msg.op === 0) {
          this.sequence = msg.s;
          if (msg.t === 'READY') {
            this.sessionId = msg.d.session_id;
            resolve(msg.d);
          }
          this.emit(msg.t, msg.d);
        }

        if (msg.op === 1) {
          this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
        }

        if (msg.op === 9) {
          setTimeout(() => this.identify(), 2000);
        }
      };

      this.ws.onerror = (err) => reject(err);

      this.ws.onclose = () => {
        this.stopHeartbeat();
        setTimeout(() => this.connectGateway(), 5000);
      };
    });
  }

  identify() {
    this.ws.send(JSON.stringify({
      op: 2,
      d: {
        token: this.token,
        capabilities: 16381,
        properties: {
          os: 'iOS',
          browser: 'Fluxer iOS',
          device: 'iPhone',
          system_locale: 'pt-BR',
        },
        presence: { status: 'online', since: 0, activities: [], afk: false },
      },
    }));
  }

  startHeartbeat(interval) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
      }
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async _get(path) {
    return fetch(`${API_BASE}${path}`, {
      headers: { Authorization: this.token },
    });
  }

  async _post(path, body) {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      body: JSON.stringify(body),
    });
  }
}

export default new FluxerAPI();
