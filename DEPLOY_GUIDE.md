# 🚀 Guida Deploy vCRM su Vercel con Neon

Questa guida ti accompagna nel deploy completo di vCRM (frontend + backend) su Vercel con database Neon Postgres.

## 📋 Prerequisiti

- Account Vercel (gratuito): https://vercel.com
- Account Neon (gratuito): https://neon.tech
- Git repository su GitHub
- 5 minuti di tempo

---

## 🎯 STEP 1: Crea Database Neon Postgres

### 1.1 Registrati su Neon

1. Vai su **[neon.tech](https://neon.tech)**
2. Click **Sign Up** (puoi usare GitHub)
3. Verifica email se richiesto

### 1.2 Crea il Database

1. Una volta loggato, click **Create a project**
2. Configura:
   - **Project name:** `vcrm-database`
   - **Region:** Seleziona la più vicina (es. Frankfurt per EU)
   - **Postgres version:** Lascia default (16)
3. Click **Create project**

### 1.3 Ottieni Connection String

1. Nella dashboard del progetto, troverai il **Connection String**
2. Copia la stringa che inizia con `postgresql://...`
3. Dovrebbe assomigliare a:
   ```
   postgresql://user:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **SALVALA** - ti servirà tra poco!

---

## 🚀 STEP 2: Deploy su Vercel

### 2.1 Import Project

1. Vai su **[vercel.com/new](https://vercel.com/new)**
2. Click **Import Git Repository**
3. Seleziona il repository GitHub `vCRM`
4. Vercel rileva automaticamente che è un progetto React ✅

### 2.2 Configura Environment Variables

**PRIMA di cliccare Deploy**, aggiungi le variabili d'ambiente:

1. Espandi **Environment Variables**
2. Aggiungi:

   **DATABASE_URL** (obbligatorio):
   ```
   postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```
   *(Usa la connection string di Neon da Step 1.3)*

   **JWT_SECRET** (obbligatorio):
   ```bash
   # Genera una chiave sicura con:
   openssl rand -base64 32

   # Oppure usa (ma cambiala dopo!):
   vcrm-secret-key-2024-change-in-production
   ```

3. Verifica che le variabili siano applicate a **Production**, **Preview**, e **Development**

### 2.3 Deploy!

1. Click **Deploy** 🚀
2. Vercel builderà e deployerà l'app (2-3 minuti)
3. Alla fine avrai il link: `https://v-crm-sigma.vercel.app`

---

## 📊 STEP 3: Inizializza Database

Il database è vuoto! Dobbiamo creare le tabelle e l'utente admin.

### 3.1 Connettiti al Database Neon

**Opzione A: Neon SQL Editor (più facile)**

1. Vai su [console.neon.tech](https://console.neon.tech)
2. Seleziona il progetto `vcrm-database`
3. Click tab **SQL Editor**

**Opzione B: psql locale**

```bash
# Installa psql se non ce l'hai
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql-client

# Connettiti (usa il connection string di Step 1.3)
psql "postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

### 3.2 Esegui Schema SQL

1. Apri il file `/api/_lib/schema.sql` dal repository
2. Copia **tutto il contenuto**
3. Incolla nell'editor SQL di Neon (o nel terminale psql)
4. Click **Run** (o premi Enter in psql)

Dovresti vedere:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
INSERT 0 1
```

### 3.3 Verifica Tabelle Create

Esegui questa query per verificare:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Dovresti vedere:
- `users`
- `contacts`
- `opportunities`
- `tasks`

---

## ✅ STEP 4: Primo Accesso

1. Vai su `https://v-crm-sigma.vercel.app` (o il tuo URL Vercel)
2. Dovresti vedere la pagina di **Login**
3. Accedi con le credenziali di default:
   - **Username:** `admin`
   - **Password:** `admin123`

### ⚠️ IMPORTANTE: Cambia Password!

1. Dopo il login, vai in **Settings** (icona ingranaggio in sidebar)
2. Sezione **Sicurezza** → **Cambia Password**
3. Inserisci:
   - Password attuale: `admin123`
   - Nuova password: (scegli una password sicura)
4. Salva

---

## 🔧 Troubleshooting

### ❌ Errore: "Database connection error"

**Causa:** Variabile `DATABASE_URL` non configurata o errata

**Soluzione:**
1. Vai su Vercel → Progetto → **Settings** → **Environment Variables**
2. Verifica che `DATABASE_URL` sia presente
3. Controlla che il connection string sia corretto (copia-incolla da Neon)
4. Redeploy: Deployments → tre puntini → **Redeploy**

### ❌ Errore: "Invalid credentials" al login

**Causa:** Utente admin non creato nel database

**Soluzione:**
1. Connettiti al database Neon (SQL Editor)
2. Esegui:
   ```sql
   SELECT username FROM users WHERE username = 'admin';
   ```
3. Se vuoto, l'utente non esiste. Esegui di nuovo lo schema SQL completo

### ❌ Errore 500 sulle API

**Causa:** JWT_SECRET mancante o errore di runtime

**Soluzione:**
1. Verifica `JWT_SECRET` in Vercel Environment Variables
2. Controlla i logs: Vercel Dashboard → **Functions** → clicca su una function → guarda **Logs**
3. Cerca errori specifici nei logs

### ❌ Pagina bianca / errori CORS

**Causa:** Frontend non riesce a chiamare le API

**Soluzione:**
1. Apri **DevTools** (F12) → **Console**
2. Cerca errori
3. Verifica che le chiamate vadano a `/api/...` (non `http://localhost:5001/api`)
4. Redeploy su Vercel

### 🔍 Debug Generale

**Logs Vercel:**
1. Dashboard Vercel → tuo progetto
2. Tab **Deployments** → click sul deploy
3. Tab **Functions** → click su una function → **Logs**

**Logs Database Neon:**
1. Neon Console → progetto
2. Tab **Monitoring** → Query history

---

## 🔄 Update dell'App

Ogni `git push` su GitHub farà il **redeploy automatico** su Vercel!

```bash
# Fai modifiche al codice
git add .
git commit -m "feat: nuova funzionalità"
git push

# Vercel rebuilda automaticamente!
```

Per forzare un redeploy senza modifiche:
1. Vercel Dashboard → **Deployments**
2. Click sui tre puntini dell'ultimo deploy
3. **Redeploy**

---

## 📝 Comandi Utili

```bash
# Test build locale
npm run build
npx serve -s build

# Deploy preview (branch)
git checkout -b feature/test
git push origin feature/test
# Vercel crea automaticamente un deploy preview!

# Connessione database
psql "$DATABASE_URL"

# Query rapida
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

---

## 🎨 Personalizzazione

### Cambiare il dominio

1. Vercel Dashboard → **Settings** → **Domains**
2. Aggiungi il tuo dominio personalizzato
3. Segui le istruzioni DNS

### Aggiungere utenti

```sql
-- Connettiti al database
-- Genera password hash su https://bcrypt-generator.com/

INSERT INTO users (username, email, password, "fullName", avatar, role)
VALUES (
  'mario.rossi',
  'mario@azienda.it',
  '$2a$10$[hash-generato]',
  'Mario Rossi',
  'MR',
  'user'
);
```

### Backup Database

Neon fa backup automatici, ma puoi anche fare backup manuali:

```bash
# Export tutto il database
pg_dump "$DATABASE_URL" > backup.sql

# Restore
psql "$DATABASE_URL" < backup.sql
```

---

## 📚 Risorse

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🎉 Congratulazioni!

Il tuo vCRM è **live** e funzionante! 🚀

Buon lavoro con il tuo CRM!

---

## 💡 Tips per uso interno

- **Non serve HTTPS** per uso interno LAN (Vercel lo fornisce gratis)
- **Performance:** Neon ha cold start ~100ms, ideale per uso interno
- **Limiti free tier Neon:**
  - 3 GB storage
  - 100 ore compute/mese (più che sufficiente per uso interno!)
  - Unlimited queries
- **Costi zero** per uso interno tipico!
