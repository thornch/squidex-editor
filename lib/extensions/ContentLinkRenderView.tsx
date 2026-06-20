/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { NodeViewComponentProps, useCommands, useExtension } from '@remirror/react';
import { Icon } from '../ui/internal/Icon';
import { ContentLinkExtension } from './ContentLinkExtension';

export const ContentLinkRenderView = ({ node, getPosition }: NodeViewComponentProps) => {
    const extension = useExtension(ContentLinkExtension);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commands = useCommands() as any;

    const contentId = node.attrs.contentId;
    const contentTitle = node.attrs.contentTitle;
    const schemaName = node.attrs.schemaName;
    const onEditContent = extension.options.onEditContent;
    const onEditLink = extension.options.onEditLink;
    const onSelectContents = extension.options.onSelectContents;

    const doReplaceContent = async () => {
        if (!onSelectContents) return;

        const pos = getPosition?.();

        if (typeof pos !== 'number') return;

        const contents = await onSelectContents();

        if (contents.length > 0) {
            commands.replaceContentAt(pos, contents[0]);
        }
    };

    return (
        <div className='squidex-editor-content-link'>
            <button type='button' className='squidex-editor-button' onClick={() => onEditContent(schemaName, contentId)}>
                <Icon type='Contents' />
            </button>

            <button type='button' className='squidex-editor-button' onClick={() => {
                const pos = getPosition?.();

                if (typeof pos === 'number') {
                    onEditLink(pos);
                }
            }}>
                <Icon type='Link' />
            </button>

            {onSelectContents && (
                <button type='button' className='squidex-editor-button' title='Replace linked page' onClick={doReplaceContent}>
                    <Icon type='Replace' />
                </button>
            )}

            <div className='squidex-editor-content-schema'>{schemaName}</div>
            <div className='squidex-editor-content-name'>{contentTitle}</div>
        </div>
    );
};