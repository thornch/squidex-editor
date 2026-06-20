/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CommandMenuItem, CommandMenuItemProps } from '@remirror/react';
import { useActive, useCommands } from '@remirror/react-core';
import * as React from 'react';
import { ClassNameExtension } from '../extensions';

export interface ToggleClassMenuItemProps extends Omit<CommandMenuItemProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
    attrs: { className: string };
    /** Override the displayed label. Defaults to attrs.className. */
    label?: string;
}

export const ToggleClassMenuItem = (props: ToggleClassMenuItemProps) => {
    const {
        attrs,
        label,
        ...rest
    } = props;

    const { setClassName } = useCommands<ClassNameExtension>();

    const handleSelect = React.useCallback(() => {
        setClassName(attrs.className);
    }, [attrs.className, setClassName]);

    const active = useActive<ClassNameExtension>().className(attrs);

    return (
        <CommandMenuItem {...rest}
            commandName='toggleClass'
            active={active}
            attrs={attrs}
            enabled
            onSelect={handleSelect}
            label={label ?? attrs?.className ?? 'No Class'}
        />
    );
};