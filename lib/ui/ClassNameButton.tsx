/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { DropdownButton, useExtension } from "@remirror/react";
import * as React from 'react';
import { isLinkClassGroup, LinkClassItem } from '../utils/linkConfig';
import { ClassNameExtension } from "./../extensions";
import { ToggleClassMenuItem } from "./ToggleClassMenuItem";
import { ToggleNoClassMenuItem } from "./ToggleNoClassMenuItem";

export const ClassNameButton = () => {
    const extension = useExtension(ClassNameExtension);

    if (!extension.options.classNames || extension.options.classNames.length === 0) {
        return null;
    }

    const items: React.JSX.Element[] = [];

    for (const entry of extension.options.classNames) {
        if (typeof entry === 'string') {
            items.push(<ToggleClassMenuItem key={entry} attrs={{ className: entry }} />);
        } else if (isLinkClassGroup(entry)) {
            // Render group items with a visual » indent prefix in the label.
            for (const item of entry.items) {
                items.push(
                    <ToggleClassMenuItem
                        key={item.value}
                        attrs={{ className: item.value }}
                        label={`\u00A0\u00BB\u00A0${item.label}`}
                    />,
                );
            }
        } else {
            const item = entry as LinkClassItem;
            items.push(<ToggleClassMenuItem key={item.value} attrs={{ className: item.value }} label={item.label} />);
        }
    }

    return (
        <DropdownButton aria-label='Class Name'icon={
            <span style={{ height: '14px', lineHeight: '14px', fontSize: '14px' }}>Class</span>
        }>
            <ToggleNoClassMenuItem />

            {items}
        </DropdownButton>
    );
};
