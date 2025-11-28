# 🚀 Guida Deploy vCRM su Vercel

Questa guida ti accompagna nel deploy completo di vCRM (frontend + backend) su Vercel.

## 📋 Prerequisiti

- Account Vercel (gratuito): https://vercel.com
- Git repository su GitHub
- 5 minuti di tempo

## 🛠️ Step 1: Crea Database Vercel Postgres

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Click su **Storage** → **Create Database**
3. Seleziona **Postgres**
4. Nome: `vcrm-database` (o nome a tua scelta)
5. Regione: Scegli la più vicina (es. Frankfurt per EU)
6. Click **Create**

## 🔑 Step 2: Configura Variabili d'Ambiente

Dopo aver creato il database:

1. Vai nelle **Settings** del database
2. Nella sezione **Credentials**, vedrai le variabili d'ambiente
3. Torna al tuo progetto Vercel
4. Vai in **Settings** → **Environment Variables**
5. Aggiungi queste variabili:

### Variabili Database (auto-generate da Vercel):
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Variabile JWT:
- `JWT_SECRET` = genera una chiave random forte:
  ```bash
  openssl rand -base64 32
  ```
  Oppure usa: `vcrm-super-secret-key-2024-change-this-in-production`

## 📊 Step 3: Inizializza Database

### Opzione A: Query diretta su Vercel

1. Vai nel tuo database Vercel
2. Click tab **Query**
3. Copia e incolla il contenuto di `/api/_lib/schema.sql`
4. Click **Run Query**

### Opzione B: Connessione locale

```bash
# Usa il connection string da Vercel
psql "your-postgres-url-from-vercel"

# Poi esegui il file schema
\i api/_lib/schema.sql
```

## 🔐 Step 4: Crea Utente Admin

Dopo aver eseguito lo schema, crea l'utente admin:

```sql
-- Password: admin123
INSERT INTO users (username, email, password, "fullName", avatar, role)
VALUES (
  'admin',
  'admin@vcrm.local',
  '$2a$10$rQZJKO7LqwKfWKwKqpbYZ.xT4kZDqY8aE5qx3qR3qZ3qZ3qZ3qZ3q',
  'Administrator',
  'AD',
  'admin'
)
ON CONFLICT (username) DO NOTHING;
```

**⚠️ Importante:** La password hashata sopra è per `admin123`. Cambiala dopo il primo login!

## 🚀 Step 5: Deploy su Vercel

### Automatic Deploy (Consigliato):

1. Fai push del codice su GitHub:
   ```bash
   git add .
   git commit -m "Setup Vercel deployment"
   git push
   ```

2. Su Vercel:
   - Click **Import Project**
   - Seleziona il repository GitHub
   - Vercel rileverà automaticamente il `vercel.json`
   - Click **Deploy**

### Manual Deploy:

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ✅ Step 6: Verifica

1. Apri l'URL del deploy (es: `https://vcrm-xxx.vercel.app`)
2. Dovresti vedere la pagina di login
3. Accedi con:
   - **Username:** `admin`
   - **Password:** `admin123`

## 🔧 Troubleshooting

### Errore 500 sulle API

**Problema:** Le API non rispondono
**Soluzione:** Controlla le variabili d'ambiente in Vercel Settings

### Errore di connessione database

**Problema:** "Database connection error"
**Soluzione:**
1. Verifica che `POSTGRES_URL` sia configurato
2. Controlla che il database sia attivo
3. Esegui lo schema SQL

### Login non funziona

**Problema:** "Invalid credentials"
**Soluzione:**
1. Verifica che l'utente admin sia stato creato
2. Controlla che `JWT_SECRET` sia configurato
3. Guarda i logs in Vercel Dashboard → Functions

### CORS errors

**Problema:** Errori CORS in console
**Soluzione:** Già risolto nel codice! Se persiste, verifica che:
- Il frontend chiami `/api` (non `http://localhost:5001/api`)
- Le variabili d'ambiente siano configurate

## 📝 Comandi Utili

```bash
# Rebuild locale per testare
npm run build

# Test locale del build
npx serve -s build

# Deploy preview
vercel

# Deploy production
vercel --prod

# Logs in tempo reale
vercel logs
```

## 🔄 Update dell'App

Ogni push su GitHub farà il redeploy automatico su Vercel!

```bash
git add .
git commit -m "Update feature"
git push
```

## 🆘 Supporto

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- GitHub Issues: https://github.com/tuouser/vcrm/issues

---

## 🎉 Congratulazioni!

Il tuo vCRM è live! 🚀

Accedi, cambia la password admin, e inizia a usare il tuo CRM!
