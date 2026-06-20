/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CommandButton, useActive, useChainedCommands, useCommands, useCurrentSelection, useRemirrorContext } from '@remirror/react';
import * as React from 'react';
import { getMarkRange } from 'remirror';
import { LinkExtension } from 'remirror/extensions';

export const LinkButtons = (props: { onEdit: () => void }) => {
    const {
        onEdit,
    } = props;

    const chain = useChainedCommands();
    const commands = useCommands();
    const { getState } = useRemirrorContext({ autoUpdate: true });
    const activeMarks = useActive<LinkExtension>();
    const activeLink = activeMarks.link();
    const selection = useCurrentSelection();

    const removeLink = React.useCallback(() => {
        chain.removeLink().focus().run();
    }, [chain]);

    const editLink = React.useCallback(() => {
        if (activeLink && selection.empty) {
            const state = getState();
            const linkType = state.schema.marks.link;

            if (linkType) {
                const range = getMarkRange(state.selection.$from, linkType);

                if (range) {
                    commands.selectText({ from: range.from, to: range.to });
                }
            }
        }

        onEdit();
    }, [activeLink, commands, getState, onEdit, selection.empty]);

    return (
        <>
            <CommandButton commandName='updateLink' enabled={!selection.empty || activeLink} label='Add or Edit Link'
                onSelect={editLink} icon='link' />

            <CommandButton commandName='removeLink' enabled={activeLink} label='Remove Link'
                onSelect={removeLink} icon='linkUnlink' />
        </>
    );
};