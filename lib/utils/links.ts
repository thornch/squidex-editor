/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

/**
 * Returns true if the string is a syntactically valid absolute URL with an
 * http/https scheme and a hostname that contains a dot followed by at least
 * two characters (i.e. a real TLD). This gates anchor-loading requests so
 * that partial keystrokes ("htt", "https:/", "https://blick.c") and bare
 * hostnames like "http://localhost" never trigger a network request.
 */
export function isValidUrl(url: string): boolean {
    if (!url) {
        return false;
    }

    try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }

        // Single-label hostnames without a dot (e.g. "localhost", "devserver")
        // are always accepted. For multi-label hostnames the TLD must be at
        // least 2 characters so that partial inputs like "blick.c" are
        // rejected while "blick.ch" and "blick.com" pass.
        const host = parsed.hostname;
        const lastDot = host.lastIndexOf('.');

        return lastDot === -1 || host.length - lastDot - 1 >= 2;
    } catch {
        return false;
    }
}

export function getAssetId(url: string, baseUrl: string, appName: string) {
    if (!url) {
        return;
    }

    const assetUrl = `${baseUrl}/api/assets/${appName}/`;

    if (url.startsWith(assetUrl)) {
        const parts = url.substring(assetUrl.length).split(/[/?]+/);

        if (parts.length < 1) {
            return null;
        }

        return { id: parts[0] };
    }

    return null;
}

/**
 * Reads Squidex image-resize query parameters from an asset URL.
 * Returns only the parameters that are actually present in the URL.
 */
export function parseAssetUrlParams(url: string): Record<string, string> {
    if (!url) return {};

    try {
        const parsed = new URL(url, 'http://x');
        const result: Record<string, string> = {};

        parsed.searchParams.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    } catch {
        return {};
    }
}

/**
 * Rebuilds an asset URL with the given query parameters.
 * Existing parameters not listed in `params` are removed.
 * Parameters with an empty string value are omitted.
 */
export function buildAssetUrl(url: string, params: Record<string, string>): string {
    if (!url) return url;

    try {
        // Use a dummy base for relative-looking URLs
        const hasScheme = /^https?:\/\//i.test(url);
        const base = hasScheme ? undefined : 'http://x';
        const parsed = base ? new URL(url, base) : new URL(url);

        // Replace all search params
        parsed.search = '';

        for (const [key, value] of Object.entries(params)) {
            if (value !== '' && value !== undefined && value !== null) {
                parsed.searchParams.set(key, value);
            }
        }

        return hasScheme ? parsed.toString() : parsed.pathname + parsed.search;
    } catch {
        return url;
    }
}

export function getContentId(url: string, baseUrl: string, appName: string) {
    if (!url) {
        return;
    }

    const schemaUrl = `${baseUrl}/api/content/${appName}/`;

    if (url.startsWith(schemaUrl)) {
        const parts = url.substring(schemaUrl.length).split(/[/?]+/);

        if (parts.length < 2) {
            return null;
        }

        return { schemaName: parts[0], id: parts[1] };
    }

    return null;
}