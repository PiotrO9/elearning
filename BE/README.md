# Express.js + TypeScript - Starter

Minimalny projekt Express.js z TypeScript - gotowy do rozbudowy.

## 🚀 Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

3. (Opcjonalnie) Dostosuj zmienne środowiskowe w pliku `.env`

## 🏃 Uruchomienie

### Tryb deweloperski (z auto-reloadem):
```bash
npm run dev
```

### Tryb produkcyjny:
```bash
# Build projektu
npm run build

# Uruchom skompilowany projekt
npm start
```

### Watch mode (kompilacja w tle):
```bash
npm run watch
```

Serwer uruchomi się domyślnie na `http://localhost:3000`

## 📡 Endpointy

- `GET /` - Testowy endpoint

## 📦 Przykładowe zapytanie

```bash
curl http://localhost:3000/
```

Odpowiedź:
```json
{
  "message": "Hello World! Serwer Express + TypeScript działa!",
  "timestamp": "2025-10-12T..."
}
```

## 🗂️ Struktura projektu

```
.
├── src/
│   └── server.ts            # Główny plik serwera
├── dist/                    # Skompilowane pliki (generowane)
├── .env.example             # Przykładowe zmienne środowiskowe
├── .gitignore              # Pliki ignorowane przez git
├── package.json            # Zależności projektu
├── tsconfig.json           # Konfiguracja TypeScript
└── README.md               # Dokumentacja
```

## 🛠️ Technologie

- **Express.js** - Framework webowy
- **TypeScript** - Typowanie statyczne
- **dotenv** - Zarządzanie zmiennymi środowiskowymi
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto-reload w trybie deweloperskim
- **ts-node** - Uruchamianie TypeScript bez kompilacji

## 📝 Notatki

- Minimalny setup z **TypeScript** i **Express.js**
- Gotowy do rozbudowy o własne endpointy
- **Strict mode** włączony dla maksymalnego bezpieczeństwa typów
- Można dodać: routes, controllers, middleware, bazę danych, walidację, autentykację, itp.

