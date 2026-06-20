/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

// ─── Class list types ────────────────────────────────────────────────────────

/**
 * A single selectable CSS class entry in the link dialog.
 * Maps to TinyMCE's `{ title, value }` items inside `link_class_list`.
 */
export interface LinkClassItem {
    /** Human-readable label shown in the dropdown. */
    label: string;

    /** CSS class value stored on the <a> element (e.g. "icon icon-external-link"). */
    value: string;
}

/**
 * A grouped set of link class items.
 * Maps to TinyMCE's `{ title, menu: [...] }` groups inside `link_class_list`.
 */
export interface LinkClassGroup {
    /** Group heading shown in the dropdown. */
    label: string;

    items: LinkClassItem[];
}

export type LinkClassEntry = LinkClassItem | LinkClassGroup;

export function isLinkClassGroup(entry: LinkClassEntry): entry is LinkClassGroup {
    return 'items' in entry && Array.isArray((entry as LinkClassGroup).items);
}

/**
 * Flattens a nested class-entry list (groups + single items) into a plain
 * `LinkClassItem[]` suitable for the link dialog.
 * Entries with an empty `value` (i.e. "None" placeholders) are skipped because
 * the dialog already renders a dedicated "no class" option.
 */
export function flattenLinkClassItems(entries: LinkClassEntry[]): LinkClassItem[] {
    const result: LinkClassItem[] = [];

    for (const entry of entries) {
        if (isLinkClassGroup(entry)) {
            for (const item of entry.items) {
                if (item.value) {
                    result.push(item);
                }
            }
        } else if (entry.value) {
            result.push(entry);
        }
    }

    return result;
}

/**
 * Flattens a mixed list of `string | LinkClassEntry` values into a plain
 * string array of CSS class values.
 * Used by ClassNameExtension which needs a flat list for ProseMirror mark
 * operations while ClassNameButton uses the original structured list for
 * rendering grouped entries with visual indentation.
 */
export function flattenClassNameValues(entries: ReadonlyArray<string | LinkClassEntry>): string[] {
    const result: string[] = [];

    for (const entry of entries) {
        if (typeof entry === 'string') {
            if (entry) result.push(entry);
        } else if (isLinkClassGroup(entry)) {
            for (const item of entry.items) {
                if (item.value) result.push(item.value);
            }
        } else if (entry.value) {
            result.push(entry.value);
        }
    }

    return result;
}

// ─── URL-mapping / anchor types ───────────────────────────────────────────────

/**
 * Single URL prefix replacement rule.
 * Maps to one `[from, to]` entry in TinyMCE's `link_url_mapping` array.
 *
 * The `to` string may contain the literal placeholder `{lang}` which is
 * replaced at runtime with the active editor language code (ISO 2-letter).
 */
export interface LinkUrlMapping {
    /** URL prefix to match (e.g. "https://cms.example.com/api/content/app/page/"). */
    from: string;

    /**
     * Replacement prefix (e.g. "https://www.example.com/{lang}/cms/").
     * Use `{lang}` to inject the active content language.
     */
    to: string;
}

// ─── Top-level external config ────────────────────────────────────────────────

/**
 * Shape of `squidex-editor.config.json` – the external configuration file
 * that is placed next to `squidex-editor.js` and loaded at runtime by the
 * Angular host component.
 *
 * All properties are optional; missing sections disable the related feature
 * in the link dialog.
 */
export interface LinkConfig {
    /**
     * Pre-configured CSS class entries (items or groups) shown in the link
     * dialog. Maps to TinyMCE's `link_class_list`.
     */
    classItems?: LinkClassEntry[];

    /**
     * Transforms internal CMS API URLs to the corresponding public frontend
     * URLs before fetching page anchors. Maps to TinyMCE's `link_url_mapping`.
     */
    urlMappings?: LinkUrlMapping[];

    /**
     * CSS selector(s) used by the backend anchor-extraction endpoint to
     * determine which elements count as named sections.
     * Maps to TinyMCE's `link_url_section_query_Selector`.
     * Default: "a[id],h2,h3,h4"
     */
    anchorQuerySelectors?: string;

    /**
     * Map of host → anchor-id[] that should be excluded from the anchor picker.
     * The special key `"*"` applies to all hosts.
     * Maps to TinyMCE's `link_ignored_anchor_by_host`.
     */
    ignoredAnchorsByHost?: Record<string, string[]>;
}

/**
 * Top-level shape of `squidex-editor.config.json`.
 */
export type EditorToolbarItem =
    | 'history'
    | 'headings'
    | 'textStyle'
    | 'blockStyle'
    | 'lists'
    | 'className'
    | 'link'
    | 'assets'
    | 'contents'
    | 'aiText'
    | 'annotation'
    | 'html'
    | 'table'
    | 'markupToggle';

export interface EditorUiConfig {
    // Whether markup mode should be editable.
    markupEditable?: boolean;

    // Toolbar items to hide/disable.
    disabledToolbarItems?: EditorToolbarItem[];

    /**
     * URL of an additional CSS file that is injected into the editor iframe /
     * page at runtime.  The file is loaded with a <link> element; removing the
     * config or changing the URL automatically removes the previous element.
     * Relative URLs are resolved relative to the page origin (same as the
     * angular app).
     */
    customStylesheetUrl?: string;

    /**
     * Default query parameters appended to Squidex asset image URLs.
     * These are applied when inserting a new image and shown as pre-filled
     * fields in the image edit dialog.  The user can override each value
     * per image.  Any key/value pair is allowed; typical Squidex params:
     *   width, height  – target dimensions in pixels
     *   mode           – resize mode: "Crop" | "Pad" | "CropUpsize" | "ResizePad" | "BoxPad"
     *   format         – output format: "webp" | "avif" | "jpg" | "png" | "bmp" | "tga" | "tiff"
     *   cache          – browser cache TTL in seconds (e.g. 3600)
     */
    assetImageParams?: AssetImageParams;
}

/**
 * Key-value map of Squidex image URL query parameters.
 * All values must be strings; omit a key to leave that parameter unchanged.
 */
export type AssetImageParams = Record<string, string>;

export interface SquidexEditorConfig {
    link?: LinkConfig;
    editor?: EditorUiConfig;
}
