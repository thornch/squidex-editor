/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { ApplySchemaAttributes, MarkExtensionSpec, MarkSpecOverride, omitExtraAttributes } from 'remirror';
import { LinkExtension } from 'remirror/extensions';

/**
 * Additional attributes stored on every link mark.
 */
export interface CustomLinkAttributes {
    // The href – inherited from the base LinkExtension.
    href: string;
    // Whether the href was created by the auto-link rule.
    auto?: boolean;
    // target="_blank" / "_self" / "_parent" / "_top"
    target?: string | null;
    // Optional CSS class from the editor's pre-configured list.
    linkClass?: string | null;
}

/**
 * CustomLinkExtension extends remirror's built-in LinkExtension with two
 * additional persisted mark attributes:
 *   - `target`   – controls the anchor's target attribute
 *   - `linkClass` – an optional CSS class from an editor-defined list
 *
 * All built-in behaviour (autoLink, onClick, onShortcut, …) is preserved
 * unchanged because we only override createMarkSpec.
 */
export class CustomLinkExtension extends LinkExtension {
    /**
     * Override createMarkSpec to inject the two additional attributes while
     * keeping the complete parseDOM / toDOM logic from the parent class.
     */
    public override createMarkSpec(
        extra: ApplySchemaAttributes,
        override: MarkSpecOverride,
    ): MarkExtensionSpec {
        const base = super.createMarkSpec(extra, override);

        return {
            ...base,
            // Merge our extra attributes on top of what the base already defined.
            attrs: {
                ...base.attrs,
                target: { default: null },
                linkClass: { default: null },
            },
            parseDOM: [
                ...(base.parseDOM ?? []),
                // Catch any <a> that carries our custom attributes so that
                // copy-pasted or pre-existing HTML retains them.
                {
                    tag: 'a[href]',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLAnchorElement)) {
                            return false;
                        }

                        const href = dom.getAttribute('href');
                        if (!href) {
                            return false;
                        }

                        return {
                            ...extra.parse(dom),
                            href,
                            target: dom.getAttribute('target') ?? null,
                            linkClass: dom.getAttribute('class') ?? null,
                        };
                    },
                },
            ],
            toDOM: (mark, inline) => {
                const { target, linkClass, ...rest } =
                    omitExtraAttributes<CustomLinkAttributes>(mark.attrs, extra) as CustomLinkAttributes & { target?: string | null; linkClass?: string | null };

                // Build the attribute object that the base toDOM would have produced.
                const baseMark = base.toDOM!(mark, inline);
                const baseAttrs: Record<string, string> =
                    Array.isArray(baseMark) && typeof baseMark[1] === 'object'
                        ? { ...baseMark[1] as Record<string, string> }
                        : { href: rest.href ?? '' };

                if (target) {
                    baseAttrs['target'] = target;
                    baseAttrs['rel'] = 'noopener noreferrer';
                }

                if (linkClass) {
                    baseAttrs['class'] = linkClass;
                }

                return ['a', baseAttrs, 0];
            },
        };
    }
}
