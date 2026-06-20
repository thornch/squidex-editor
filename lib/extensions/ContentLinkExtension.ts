/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { command, CommandFunction, extension, ExtensionTag, NodeExtension, NodeExtensionSpec, PrimitiveSelection, Static } from 'remirror';
import { Content, OnSelectContents } from '../props';
import { getContentId } from '../utils';
import { ContentLinkRenderView } from './ContentLinkRenderView';

export interface ContentLinkExtensionOptions {
    // The base url.
    baseUrl: Static<string>;

    // The name to the app.
    appName: Static<string>;

    // Called when a content is to be edited.
    onEditContent: Static<(schemaName: string, id: string) => void>;

    // Called when the content link metadata (href/target/class) should be edited.
    onEditLink: Static<(pos: number) => void>;

    // Called when the user wants to pick a different content item for an existing link.
    // Optional – button is hidden when not provided.
    onSelectContents: Static<OnSelectContents | undefined>;
}

@extension<ContentLinkExtensionOptions>({
    defaultOptions: { onSelectContents: undefined },
    staticKeys: ['appName', 'baseUrl', 'onEditContent', 'onEditLink', 'onSelectContents']
})
export class ContentLinkExtension extends NodeExtension<ContentLinkExtensionOptions> {
    public get name(): string {
        return 'contentLink' as const;
    }

    constructor(options: ContentLinkExtensionOptions) {
        super({ ...options, disableExtraAttributes: true });
    }

    public createTags() {
        return [ExtensionTag.InlineNode, ExtensionTag.Media];
    }

    public createNodeSpec(): NodeExtensionSpec {
        return {
            inline: true,
            selectable: true,
            attrs: {
                contentId: { default: '' },
                contentTitle: { default: '' },
                schemaName: { default: '' },
                href: { default: '' },
                target: { default: null },
                linkClass: { default: null },
            },
            toDOM: node => {
                const fallbackHref = `${this.options.baseUrl}/api/content/${this.options.appName}/${node.attrs.schemaName}/${node.attrs.contentId}`;
                const href = node.attrs.href || fallbackHref;
                const attrs: Record<string, string> = { href };

                if (node.attrs.target) {
                    attrs.target = node.attrs.target;
                    attrs.rel = 'noopener noreferrer';
                }

                if (node.attrs.linkClass) {
                    attrs.class = node.attrs.linkClass;
                }

                return ['a', attrs, node.attrs.contentTitle];
            },
            parseDOM: [
                {
                    tag: 'a[href]',
                    getAttrs: (dom) => {
                        const href = (dom as HTMLAnchorElement).getAttribute('href');

                        if (!href) {
                            return false;
                        }

                        const content = getContentId(href, this.options.baseUrl, this.options.appName);

                        if (!content) {
                            return false;
                        }

                        return {
                            contentId: content.id,
                            contentTitle: (dom as HTMLElement).innerText,
                            schemaName: content.schemaName,
                            href,
                            target: (dom as HTMLAnchorElement).getAttribute('target') ?? null,
                            linkClass: (dom as HTMLAnchorElement).getAttribute('class') ?? null,
                        };
                    },
                    priority: 100000,
                },
            ],
        };
    }

    public ReactComponent = ContentLinkRenderView;

    @command({})
    public addContent(content: Content, selection?: PrimitiveSelection): CommandFunction {
        const href = `${this.options.baseUrl}/api/content/${this.options.appName}/${content.schemaName}/${content.id}`;

        return this.store.commands.insertNode.original(this.type, {
            attrs: {
                contentId: content.id,
                contentTitle: content.title,
                schemaName: content.schemaName,
                href,
                target: null,
                linkClass: null,
            },
            selection
        });
    }

    /**
     * Replaces the content reference at `pos` with a new content item while
     * preserving the existing display-title, target and linkClass attributes.
     */
    @command({})
    public replaceContentAt(pos: number, content: Content): CommandFunction {
        const href = `${this.options.baseUrl}/api/content/${this.options.appName}/${content.schemaName}/${content.id}`;

        return ({ state, dispatch }) => {
            const node = state.doc.nodeAt(pos);

            if (!node || node.type !== this.type) {
                return false;
            }

            const attrs = {
                ...node.attrs,
                contentId: content.id,
                schemaName: content.schemaName,
                href,
            };

            if (dispatch) {
                const tr = state.tr.setNodeMarkup(pos, undefined, attrs);
                dispatch(tr);
            }

            return true;
        };
    }
}