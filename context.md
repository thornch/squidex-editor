# Squidex Editor Kontext (Session-Übergabe)

Datum: 2026-06-19

## Zielbild / Soll-Zustand

Die Link-Funktionalität im neuen Editor soll projekt-spezifisch konfigurierbar sein, ohne den Editor pro Anpassung neu zu bauen.

Ziel:
- Link-Dialog unterstützt URL, Anchor, Target und CSS-Klasse.
- Link-Mark speichert `href`, `target` und `class` dauerhaft im Dokument.
- Klassen, URL-Mappings und Anchor-Regeln kommen aus externer Runtime-Config (`squidex-editor.config.json`).
- Angular-Host lädt die Config beim Start und übergibt Werte an den Editor.

## Erarbeitetes Wissen

- Eingesetzter Editor ist ein eigener Remirror/ProseMirror-basierter Bundle-Editor (`squidex-editor.js`).
- Erweiterungen in `EditorProps` funktionieren, wenn sie bis zur Angular-Wrapper-Schnittstelle durchgezogen werden.
- Für linkbezogene Anpassungen ist eine eigene `CustomLinkExtension` sinnvoll.
- Runtime-Konfigurationsdaten gehören in die Squidex-Static-Datei unter `wwwroot/editor/`.

## Was angepasst wurde

### Im Repo C:\DATA\SquidexEditor

1. Link-Konfigurationsmodell eingeführt:
- `lib/utils/linkConfig.ts` (neu)
- enthält Typen für Klassen, Mappings, Anchor-Selektoren, Ignore-Listen
- enthält `flattenLinkClassItems(...)`

2. Exporte ergänzt:
- `lib/utils/index.ts` exportiert `linkConfig`
- `lib/squidex-editor.ts` exportiert global `SquidexEditorFlattenLinkClassItems`
- `lib/extensions/index.ts` exportiert `CustomLinkExtension`

3. Props erweitert und repariert:
- `lib/props.ts`
- enthält jetzt korrekt wieder den `Asset`-Typ (war zwischenzeitlich beschädigt)
- neue Props: `linkClassNames?: ReadonlyArray<LinkClassItem>`
- neue Prop: `loadLinkAnchors?: LoadLinkAnchors`

4. Editor auf Custom-Link-Extension umgestellt:
- `lib/Editor.tsx`
- nutzt `CustomLinkExtension` statt Standard-LinkExtension
- übergibt `linkClassNames` und `loadLinkAnchors` an `LinkModal`
- Hinweis: `linkClassNames` wird nicht als Option in den `CustomLinkExtension`-Konstruktor übergeben (Remirror-API-kompatibel korrigiert)

5. Custom-Link-Extension implementiert und API-kompatibel korrigiert:
- `lib/extensions/CustomLinkExtension.ts`
- erweitert Link-Mark um Attribute `target` und `linkClass`
- parseDOM/toDOM berücksichtigt `target`, `rel`, `class`
- auf gültige Vererbung umgestellt: `extends LinkExtension` (ohne Generics)
- Decorator/Generic-Inkompatibilitäten entfernt

6. Link-Dialog erweitert:
- `lib/ui/LinkModal.tsx`
- UI für Class-Auswahl und Anchor-Auswahl
- Klassenmodell `label`/`value` berücksichtigt

7. Build/Deploy:
- Build in `C:\DATA\SquidexEditor` erfolgreich
- `dist/squidex-editor.js` nach
  `C:\DATA\SquidexCmsSource\backend\src\Squidex\wwwroot\editor\squidex-editor.js`
  kopiert

### Im Repo C:\DATA\SquidexCmsSource

1. Runtime-Config angelegt:
- `backend/src/Squidex/wwwroot/editor/squidex-editor.config.json`
- enthält link.classItems, link.urlMappings, link.anchorQuerySelectors, link.ignoredAnchorsByHost

2. Frontend-Typen ergänzt:
- `frontend/src/app/declarations.d.ts`
- Typen für Config + globale Funktion `SquidexEditorFlattenLinkClassItems`
- EditorProps-Erweiterungen für Angular-Wrapper

3. Angular-Integration ergänzt:
- `frontend/src/app/shared/components/forms/rich-editor.component.ts`
- lädt `editor/squidex-editor.config.json`
- baut `loadLinkAnchors` (Mappings, Ignore-Regeln, Cache)
- übergibt `linkClassNames` und `loadLinkAnchors` an `SquidexEditorWrapper`

## Wichtigste Dateien

### Editor (Quelle)
- `C:\DATA\SquidexEditor\lib\Editor.tsx`
- `C:\DATA\SquidexEditor\lib\props.ts`
- `C:\DATA\SquidexEditor\lib\extensions\CustomLinkExtension.ts`
- `C:\DATA\SquidexEditor\lib\ui\LinkModal.tsx`
- `C:\DATA\SquidexEditor\lib\utils\linkConfig.ts`
- `C:\DATA\SquidexEditor\lib\squidex-editor.ts`

### Host-Integration (Squidex)
- `C:\DATA\SquidexCmsSource\backend\src\Squidex\wwwroot\editor\squidex-editor.js` (ausgeliefertes Bundle)
- `C:\DATA\SquidexCmsSource\backend\src\Squidex\wwwroot\editor\squidex-editor.config.json` (Runtime-Config)
- `C:\DATA\SquidexCmsSource\frontend\src\app\declarations.d.ts`
- `C:\DATA\SquidexCmsSource\frontend\src\app\shared\components\forms\rich-editor.component.ts`

## Schnittstelle aus Angular-Umfeld (exakte Script-Einbindung)

Die Editor-Skriptdatei wird hier geladen:
- Datei: `C:\DATA\SquidexCmsSource\frontend\src\app\shared\components\forms\rich-editor.component.ts`
- Stelle: in `ngAfterViewInit()` über
  `this.resourceLoader.loadLocalScript('editor/squidex-editor.js')`

Damit ist die Laufzeitquelle des Editors die statische Datei unter:
- `C:\DATA\SquidexCmsSource\backend\src\Squidex\wwwroot\editor\squidex-editor.js`

## Aktueller Stand Validierung

- TypeScript/Build-Fehler in `Editor.tsx`, `props.ts`, `CustomLinkExtension.ts` wurden behoben.
- Build in `C:\DATA\SquidexEditor` läuft erfolgreich.
- Bundle wurde in Squidex `wwwroot/editor/` aktualisiert.

## Bekannte Betriebs-Hinweise

- Nach Austausch von `squidex-editor.js` Browser hart neu laden (Ctrl+F5), ggf. Cache leeren.
- Falls weiterhin Laufzeitfehler auftreten, Backend neu starten, damit garantiert der aktuelle Asset-Stand ausgeliefert wird.

## Nächste sinnvolle Schritte

1. In laufender Squidex-Instanz Link-Dialog öffnen und prüfen:
   - Klassenliste kommt aus `squidex-editor.config.json`
   - Anchor-Liste wird geladen und gefiltert
   - `target` und `class` werden am Link gespeichert
2. Optional: kleine E2E-Prüfung für Link-Erstellung/Update ergänzen.
