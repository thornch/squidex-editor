/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

const ADDED_CLASSES: Record<string, boolean> = {};

export function addClassStyle(className: string, prefix: string) {
    if (ADDED_CLASSES[className]) {
        return;
    }

    const styleElement = document.createElement("style");

    const colorHash = hashCode(className) / 10000;
    const colorValue = hsvToRgb({ h: Math.abs(colorHash), s: 0.6, v: 0.6 });
    const colorHex = colorString(colorValue);

    styleElement.type = "text/css";
    styleElement.textContent = `
        .remirror-editor-wrapper .${prefix}${className}::before {
            content: '[${className}]';
            font-family: monospace;
            font-size: 90%;
            color: ${colorHex};
        }
        
        .remirror-editor-wrapper .${prefix}${className}::after {
            content: '[/${className}]';
            font-family: monospace;
            font-size: 90%;
            color: ${colorHex};
        }

        /* When this class span is nested inside another class span,
           prepend \u00A0\u00BB\u00A0 (\u00A0=nbsp, \u00BB=\u00BB) per depth level to indicate nesting.
           The attribute selector [class*="${prefix}"] matches any ancestor
           that carries an editor class mark, so the rule only fires when
           there is at least one enclosing class span. Specificity of this
           rule is intentionally higher (0-3-0) than the base rule (0-2-0)
           so it overrides without needing !important. */
        .remirror-editor-wrapper [class*="${prefix}"] .${prefix}${className}::before {
            content: '\u00A0\u00BB\u00A0[${className}]';
        }

        .remirror-editor-wrapper [class*="${prefix}"] [class*="${prefix}"] .${prefix}${className}::before {
            content: '\u00A0\u00BB\u00A0\u00A0\u00BB\u00A0[${className}]';
        }
    `;

    document.head.appendChild(styleElement);

    ADDED_CLASSES[className] = true;
}

function hashCode(value: string) {
    let hash = 0;

    if (!value || value.length === 0) {
        return hash;
    }

    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);

        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return hash;
}

function hsvToRgb({ h, s, v }: HSVColor): RGBColor {
    h /= 60;

    const i = Math.floor(h);
    const f = (h - i);
    const p = (v * (1 - s));
    const q = (v * (1 - (f * s)));
    const t = (v * (1 - ((1 - f) * s)));

    function color(r: number, g: number, b: number) {
        return { r, g, b };
    }

    switch (i % 6) {
        case 0:
            return color(v, t, p);
        case 1:
            return color(q, v, p);
        case 2:
            return color(p, v, t);
        case 3:
            return color(p, q, v);
        case 4:
            return color(t, p, v);
        default:
            return color(v, p, q);
    }
}

function colorString({ r, g, b }: RGBColor) {
    let rs = Math.round(r * 255).toString(16);
    let gs = Math.round(g * 255).toString(16);
    let bs = Math.round(b * 255).toString(16);

    if (rs.length === 1) {
        rs = `0${rs}`;
    }
    if (gs.length === 1) {
        gs = `0${gs}`;
    }
    if (bs.length === 1) {
        bs = `0${bs}`;
    }

    return `#${rs}${gs}${bs}`;
}

interface RGBColor {
    r: number;
    g: number;
    b: number;
}

interface HSVColor {
    h: number;
    s: number;
    v: number;
}