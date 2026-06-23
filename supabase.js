/**
 * La Casa Del Helado — Supabase Client
 * =====================================
 * CONFIGURACIÓN:
 * 1. Crea un proyecto en https://supabase.com
 * 2. Ve a Settings > API
 * 3. Copia tu Project URL y anon public key
 * 4. Reemplaza los valores abajo
 */

const SUPABASE_URL = 'https://nqdninpjwfbhzipkrjmu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PL8_uNRQDWo6AapCLtGbsQ_y1ABx2dv';

// ─── Supabase Client (sin npm, vía CDN cargado en HTML si se prefiere)
// Para este setup usamos fetch directo con las headers correctas.

const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  headers() {
    return {
      'Content-Type':  'application/json',
      'apikey':        this.key,
      'Authorization': `Bearer ${this.key}`,
    };
  },

  /* ── SELECT ─────────────────────────────────────────── */
  async from(table) {
    return new SupabaseQuery(this, table);
  },
};

class SupabaseQuery {
  constructor(client, table) {
    this.client   = client;
    this.table    = table;
    this._filters = [];
    this._order   = '';
    this._select  = '*';
    this._single  = false;
    this._data    = null;
    this._method  = 'GET';
    this._update  = false;
    this._delete  = false;
    this._id      = null;
  }

  select(cols = '*') { this._select = cols; return this; }

  eq(col, val)  { this._filters.push(`${col}=eq.${val}`); return this; }
  neq(col, val) { this._filters.push(`${col}=neq.${val}`); return this; }

  order(col, { ascending = true } = {}) {
    this._order = `${col}=${ascending ? 'asc' : 'desc'}`;
    return this;
  }

  single() { this._single = true; return this; }

  insert(data)    { this._method = 'POST'; this._data = data; return this; }
  update(data)    { this._method = 'PATCH'; this._data = data; return this; }
  delete()        { this._method = 'DELETE'; return this; }

  async execute() {
    let url = `${this.client.url}/rest/v1/${this.table}?select=${this._select}`;
    if (this._filters.length) url += `&${this._filters.join('&')}`;
    if (this._order)          url += `&order=${this._order}`;

    const opts = {
      method:  this._method,
      headers: { ...this.client.headers(), 'Prefer': 'return=representation' },
    };

    if (this._data) opts.body = JSON.stringify(this._data);

    try {
      const res  = await fetch(url, opts);
      const json = await res.json();
      if (!res.ok) return { data: null, error: json };
      return { data: this._single ? json[0] : json, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

// Auth helpers
const auth = {
  async signInWithPassword({ email, password }) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    localStorage.setItem('sb_token', data.access_token);
    localStorage.setItem('sb_user',  JSON.stringify(data.user));
    return { data, error: null };
  },

  async signOut() {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    return { error: null };
  },

  getUser() {
    const u = localStorage.getItem('sb_user');
    return u ? JSON.parse(u) : null;
  },

  getToken() {
    return localStorage.getItem('sb_token');
  },
};

// Upload helper for images
async function uploadImage(file, bucket = 'productos') {
  const token    = auth.getToken();
  const ext      = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const url      = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`;

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token || SUPABASE_KEY}`,
      'apikey':        SUPABASE_KEY,
      'Content-Type':  file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json();
    return { url: null, error: err };
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
  return { url: publicUrl, error: null };
}
