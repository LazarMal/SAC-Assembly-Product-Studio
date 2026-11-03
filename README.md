# S.A.C. Assembly — Product Collection

Interaktivni demo katalog sa **Venetian Blinds** i **IDD Insect Door** konfiguratorima.

## Pokretanje

Otvorite `index.html` lokalno ili u VS Code-u pokrenite **Live Server**.
Sve tri HTML stranice moraju ostati u istom folderu:

- `index.html` — katalog sa scroll animacijom
- `venetian.html` — Venetian Blind konfigurator
- `insect-door.html` — IDD Insect Door konfigurator

Slike, CSS i JavaScript su ugrađeni u HTML, bez potrebe za build korakom ili bazom podataka.

## GitHub Pages — automatski deploy

1. Napravite GitHub repozitorijum (preporučeni naziv: `SAC-Assembly-Product-Studio`).
2. Postavite **sadržaj ovog foldera u root repozitorijuma** na granu `main`, uključujući skriveni `.github` folder.
3. GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. GitHub **Actions → Deploy S.A.C. Assembly website**. Posle uspešnog workflow-a dobijate live URL, obično `https://KORISNIK.github.io/REPO/`.
5. Svaki naredni `git push` na `main` automatski pokreće novo objavljivanje.

Ako koristite privatni repozitorijum, proverite podršku svog GitHub plana za Pages. Kod javnog repozitorijuma i GitHub Pages i izvorni kod su javno dostupni.

## Ažuriranje

Napravi izmene u VS Code-u, pa:

```bash
git add .
git commit -m "Update S.A.C. product studio"
git push
```

Nakon uspešnog GitHub Actions deploy-a izmene će biti live.

## Važno

Ovo je **vizuelni prototip**. Prikazane komponente i konfiguracije nisu potvrđena proizvodna specifikacija i ne služe za obračun narudžbina.