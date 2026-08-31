# MapKit JS + property data (Phase 0)

Locked basemap preference: **Apple MapKit JS**.
Until `MAPKIT_JS_TOKEN` is present, production uses **OpenStreetMap** tiles so the hero does not show a vendor watermark.

## What Apple is for

Roads, parks, businesses, satellite, address search, Place IDs, Look Around (later), snapshots.

Apple does **not** provide: parcel polygons, TIN/PIN, owner of record, vacancy, list price, MLS photos, demand bars, phase, escrow %, or tokens.

## Token setup (founder)

1. Enroll in the Apple Developer Program ($99/yr), preferably as Build Our Community, LLC.
2. Certificates → Services → Maps → Tokens → MapKit JS.
3. Restrict to `buildourcommunity.co`, the Replit preview host, and `localhost`.
4. Put the value in Replit Secrets as `MAPKIT_JS_TOKEN`. Never commit it. Never prefix `VITE_`.
5. Server should expose `GET /api/maps/token` that reads the secret. Do not ship the raw membership token to every page load longer than needed.

## Property pins (what the map may show)

Only rows already in RevitaHub state:

- `nomination`
- `live_offering`
- `funded`
- `needs_engagement`

Do not render ~116k Cherokee tax parcels in the browser.

## Parcel lookup (free, official)

Cherokee County GIS ArcGIS REST:

`https://gis.cherokeecountyga.gov/arcgis/rest/services/MainLayers/MapServer/1`

Query one parcel per nomination (GeoJSON). Store `parcelTin`, site address, simplified geometry, and Apple Place ID on the property row.

Assessor UI: Beacon (Schneider).

Paid bulk (Regrid / ReportAll / ATTOM) is optional later for owner-outreach — not required to paint the first map.

## User-facing limits (keep on the UI)

- Cherokee County alpha. Pins are live RevitaHub properties only — not every parcel.
- Nomination → community threshold → KYC → escrow.
- Tokens are interests in a property SPV, not a Realtor listing.
- Transfers lock until the raise completes. Missed target → refund + 3% APR.
- Founder 1% pays only if the project funds and impact score is 70+.
