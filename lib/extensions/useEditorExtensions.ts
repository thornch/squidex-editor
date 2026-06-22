/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CountExtension } from '@remirror/extension-count';
import * as React from 'react';
import { AnnotationExtension, BlockquoteExtension, BoldExtension, BulletListExtension, CodeBlockExtension, CodeExtension, HardBreakExtension, HeadingExtension, HorizontalRuleExtension, ImageExtension, ItalicExtension, ListItemExtension, MarkdownExtension, OrderedListExtension, StrikeExtension, TableExtension, TrailingNodeExtension, UnderlineExtension } from 'remirror/extensions';
import { LinkClassEntry, OnAssetUpload, OnContentEdit, OnSelectContents, SquidexEditorMode } from '../props';
import { htmlToMarkdown, markdownToHtml, supportedLanguages } from '../utils';
import { BackspaceKeyExtension } from './BackspaceExtension';
import { ClassNameExtension } from './ClassNameExtension';
import { ClipboardExtension } from './ClipboardExtension';
import { ContentLinkExtension } from './ContentLinkExtension';
import { CustomLinkExtension } from './CustomLinkExtension';
import { PlainHtmlExtension } from './PlainHtmlExtension';

export interface UseEditorExtensionsOptions {
    appName: string;
    baseUrl: string;
    canSelectContents?: boolean;
    classNames?: ReadonlyArray<string | LinkClassEntry>;
    mode: SquidexEditorMode;
    onEditContent: OnContentEdit;
    onOpenContentLinkModal: (pos: number) => void;
    onSelectContents?: OnSelectContents;
    onUpload?: OnAssetUpload;
}

/**
 * Returns a stable `extensions` factory callback for `useRemirror`.
 * All Remirror extension instances are created here to keep `Editor.tsx` lean.
 */
export function useEditorExtensions(opts: UseEditorExtensionsOptions) {
    const {
        appName,
        baseUrl,
        canSelectContents,
        classNames,
        mode,
        onEditContent,
        onOpenContentLinkModal,
        onSelectContents,
        onUpload,
    } = opts;

    return React.useCallback(() => [
        new AnnotationExtension({}),
        new BackspaceKeyExtension(),
        new BlockquoteExtension(),
        new BoldExtension({}),
        new BulletListExtension({ enableSpine: true }),
        new ClassNameExtension({ classNames: classNames || [] }),
        new ClipboardExtension({ mode }),
        new CodeBlockExtension({ supportedLanguages, nodeOverride: { selectable: false } }),
        new CodeExtension(),
        new ContentLinkExtension({
            appName,
            baseUrl,
            onEditContent,
            onEditLink: onOpenContentLinkModal,
            onSelectContents: canSelectContents ? onSelectContents : undefined,
        }),
        new CountExtension({}),
        new HardBreakExtension(),
        new HeadingExtension({}),
        new HorizontalRuleExtension({}),
        new ImageExtension({ uploadHandler: onUpload, nodeOverride: { selectable: true, marks: '_' } }),
        new ItalicExtension(),
        new CustomLinkExtension({
            autoLink: true,
            markOverride: {
                excludes: undefined,
            },
        }),
        new ListItemExtension({
            enableCollapsible: true,
        }),
        new MarkdownExtension({
            copyAsMarkdown: mode === 'Markdown',
            htmlToMarkdown,
            htmlSanitizer: undefined,
            markdownToHtml,
        }),
        new OrderedListExtension(),
        new PlainHtmlExtension(),
        new StrikeExtension(),
        new TableExtension({ resizable: false }),
        new TrailingNodeExtension({}),
        new UnderlineExtension(),
    ], [appName, baseUrl, canSelectContents, classNames, mode, onEditContent, onOpenContentLinkModal, onSelectContents, onUpload]);
}
