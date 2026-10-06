# Biblioteka Ane i Jusufa Kalamperović

Gotov statički sajt za GitHub Pages.

## Šifra
Podrazumijevana šifra je:

`kalamperovic`

Promijeni je u `app.js`, na samom vrhu:

```js
const SITE_PASSWORD = 'kalamperovic';
```

Ovo je jednostavna porodična zaštita, ne sigurnosni login sistem.

## Ažuriranje knjiga
`books.json` sadrži biblioteku. Naslovi knjiga su zapisani velikim slovima.

## GitHub Pages
Uploadaj sadržaj ovog foldera u root repozitorijuma, zatim:
Settings → Pages → Deploy from a branch → main → /(root) → Save.
