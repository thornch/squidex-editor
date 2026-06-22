/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements: { [index: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};
const getEscapeReplacement = (ch: string) => escapeReplacements[ch];

/**
 * Normalizes HTML by parsing it through the browser DOM, removing the
 * indentation whitespace added by the Ace-based HTML formatter.
 * Without this ProseMirror interprets the whitespace as text nodes which
 * corrupts the rendered document.
 */
export function stripHtmlFormatting(html: string): string {
    try {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.innerHTML;
    } catch {
        return html;
    }
}

export function escapeHTML(html: string, encode?: boolean) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
        }
    } else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
    }

    return html;
}