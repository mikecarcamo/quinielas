# Quiniela Mundial 2026

Aplicación web fullstack para quinielas del Mundial 2026.

## Stack
- **Frontend**: React + Vite + MUI v5 (puerto 3001)
- **Backend**: Node.js + Express + SQLite (better-sqlite3) (puerto 4001)
- **Auth**: JWT + bcryptjs
- **PDF**: PDFKit
- **DB**: `/app/data/dei.sqlite`

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
node src/db/migrate.js   # Crea DB, admin y fixture
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Credenciales iniciales
- **Admin**: `admin@quiniela.com` / `Admin1234!`

## Lógica de puntos
| Acierto | Puntos |
|---|---|
| Goles local exactos | +5 |
| Goles visitante exactos | +5 |
| Resultado correcto (ganador/empate) | +2 |
| **Máximo por partido** | **12** |

## Distribución del pozo
- 1er lugar: 85%
- 2do lugar: 10%
- 3er lugar: 5%

## Flujo de usuario
1. Registro → Subir comprobante de pago ($100)
2. Admin aprueba pago → Usuario habilitado
3. Usuario llena quiniela (una sola vez, no editable)
4. Admin carga resultados → puntos se recalculan automáticamente
5. Ranking público en tiempo real
