# S.A.C. Assembly — Home Collection

Premium interactive demo catalog for three product families:

- Venetian blinds (`venetian.html`)
- IDD Original Pleated Screen Door (`insect-door.html`) — mounted inside the opening
- ODD Original Pleated Screen Door (`odd-door.html`) — surface/on-face mounted over the opening, Single/Double

## Run
Open `index.html` or run `python -m http.server 8000` and browse to http://localhost:8000.

The three configurators use the same shared navigation, panels, controls and mobile behavior.
No backend, payments or login. All images and scripts are embedded in their HTML files.

## Production status
This is a **visual/interactive concept**, not a signed-off manufacturing specification or
quotation engine. ODD outside-mount framing and mitred joints are informed by KeJe
public information; profile section details must be verified with actual S.A.C.
production drawings. PCF RAL options are included; widths/heights are demo assumptions.
`Supplier` is a free-text field until a definitive supplier list exists.
Quantity has no configured upper limit.

## Publishing
GitHub Pages deploys automatically on pushes to `main` via the existing workflow.