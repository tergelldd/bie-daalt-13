# Architecture (Mermaid) — URL Shortener

**Target stack:** NestJS (REST API) + PostgreSQL + React (Vite) (+ optional Redis)  
**Core features:** random short code, redirect + click counter, expiration

## Module / Layer diagram

```mermaid
flowchart TB
  %% =======================
  %% Presentation layer
  %% =======================
  subgraph P["Presentation layer"]
    UI["Minimal Frontend (React/Vite)\n- Create form\n- Stats view\n- Copy short link"]
    Browser["Browser (redirect click)"]
  end

  %% =======================
  %% API / Application layer
  %% =======================
  subgraph A["API / Application layer (NestJS)"]
    C1["UrlController\n- POST /api/urls\n- GET  /api/urls/:code"]
    C2["RedirectController\n- GET /:code"]
    S1["UrlService\n- generateCode()\n- validateUrl()\n- createShortUrl()\n- getStats()"]
    S2["RedirectService\n- resolveLongUrl()\n- checkExpiration()\n- incrementClicks()"]
    R1["UrlRepository (ORM)\n- insert/find/update"]
    J1["ExpirationJob (optional)\n- cleanupExpired()"]
  end

  %% =======================
  %% Data layer
  %% =======================
  subgraph D["Data layer"]
    DB["PostgreSQL\nTable: urls\n- code (unique)\n- long_url\n- clicks\n- created_at\n- expires_at"]
    Cache["Redis (optional)\n- code→long_url cache\n- rate limit\n- counter buffering"]
  end

  UI -->|"HTTP JSON"| C1
  UI -->|"GET stats"| C1

  Browser -->|"GET /:code"| C2

  C1 --> S1
  C2 --> S2

  S1 --> R1
  S2 --> R1

  R1 --> DB

  S2 -.->|"optional cache read/write"| Cache
  S1 -.->|"optional rate limit"| Cache

  J1 --> R1
  J1 --> DB
```

## Data flow (Sequence)

```mermaid
sequenceDiagram
  autonumber

  participant U as User (Frontend)
  participant API as NestJS REST API
  participant RED as Redis (optional)
  participant DB as PostgreSQL

  rect rgba(220,220,220,0.25)
  note over U,DB: Flow 1 — Create short link (POST /api/urls)
  U->>API: POST /api/urls { longUrl, expiresAt? }
  API->>DB: INSERT url (generate random code; retry on collision)
  DB-->>API: created record { code, ... }
  API-->>U: 201 { shortUrl, code, ... }
  end

  rect rgba(220,220,220,0.25)
  note over U,DB: Flow 2 — Redirect + click counter (GET /:code)
  U->>API: GET /:code
  opt Redis cache enabled
    API->>RED: GET code
    alt Cache hit
      RED-->>API: longUrl (+ expiresAt?)
    else Cache miss
      RED-->>API: null
      API->>DB: SELECT * FROM urls WHERE code=?
      DB-->>API: url record
      API->>RED: SET code -> longUrl (TTL ~= expiresAt)
    end
  end
  alt Not found
    API-->>U: 404 Not Found
  else Expired
    API-->>U: 410 Gone (or 404)
  else Active
    par Increment clicks
      API->>DB: UPDATE urls SET clicks = clicks + 1 WHERE code=?
    and Redirect
      API-->>U: 302 Location: longUrl
    end
  end
  end

  rect rgba(220,220,220,0.25)
  note over U,DB: Flow 3 — Stats (GET /api/urls/:code)
  U->>API: GET /api/urls/:code
  API->>DB: SELECT * FROM urls WHERE code=?
  DB-->>API: url record
  API-->>U: 200 { longUrl, clicks, createdAt, expiresAt, status }
  end
```
