/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CommandButtonGroup, FloatingToolbar, ToggleBoldButton, ToggleCodeButton, ToggleItalicButton, ToggleUnderlineButton, useActive, useCurrentSelection } from '@remirror/react';
import classNames from 'classnames';
import * as React from 'react';
import { CodeBlockExtension } from 'remirror/extensions';
import { ToolbarItem } from '../props';
import { useDebounceBoolean } from '../utils';
import { LinkButtons } from './LinkButtons';

interface ToolbarWrapperProps {
    onLinkModal: () => void;
    isToolbarItemDisabled: (item: ToolbarItem) => boolean;
}

export const ToolbarWrapper = ({ onLinkModal, isToolbarItemDisabled }: ToolbarWrapperProps) => {
    const active = useActive<CodeBlockExtension>();
    const selection = useCurrentSelection();
    const visible = useDebounceBoolean(400, [selection.from, selection.to]);

    if (active.codeBlock()) {
        return null;
    }

    return (
        <FloatingToolbar className={classNames('squidex-editor-floating', { hidden: !visible })}>
            <fieldset className='squidex-editor-menu-group'>
                <CommandButtonGroup>
                    {!isToolbarItemDisabled('textStyle') && (
                        <>
                            <ToggleBoldButton />
                            <ToggleItalicButton />
                            <ToggleUnderlineButton />
                            <ToggleCodeButton />
                        </>
                    )}

                    {!isToolbarItemDisabled('link') && <LinkButtons onEdit={onLinkModal} />}
                </CommandButtonGroup>
            </fieldset>
        </FloatingToolbar>
    );
};
