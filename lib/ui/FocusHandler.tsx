/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { useRemirrorContext } from '@remirror/react';
import * as React from 'react';

export const FocusHandler = ({ className, children }: React.PropsWithChildren & { className?: string }) => {
    const { commands, view } = useRemirrorContext();
    const wasFocusedBefore = React.useRef(false);

    const doFocus = React.useCallback((event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest('[contenteditable="true"]')) {
            return;
        }

        if (view.hasFocus()) {
            return;
        }

        if (wasFocusedBefore.current) {
            commands.focus();
        } else {
            commands.focus('start');
        }

        wasFocusedBefore.current = true;
    }, [commands, view]);

    return (
        <div className={className} onClick={doFocus}>
            {children}
        </div>
    );
};