/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import * as React from 'react';

export const Modal = (props: { title?: string } & React.PropsWithChildren) => {
    const {
        children,
        title,
    } = props;

    const windowRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        windowRef.current?.focus();
    }, []);

    const stopPropagation = React.useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
    }, []);

    return (
        // onClick stopPropagation prevents FocusHandler (parent) from calling
        // commands.focus() and stealing focus away from modal fields.
        // We do NOT use capture-phase here — that would block events from
        // reaching child elements (inputs, selects, buttons) before they fire.
        <div className='squidex-editor-modal-wrapper' onClick={stopPropagation} onMouseDown={stopPropagation}>
            <div className='squidex-editor-modal-backdrop'></div>
            <div className='squidex-editor-modal-window' ref={windowRef} tabIndex={-1}>
                {title &&
                    <div className='squidex-editor-modal-title'>
                        {title}
                    </div>
                }

                <div className='squidex-editor-modal-body'>
                    {children}
                </div>
            </div>
        </div>
    );
};