/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import * as React from 'react';

export const StopClick = ({ className, children }: React.PropsWithChildren & { className?: string }) => {
    const doStop = React.useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
    }, []);

    return (
        <div className={className} onClick={doStop}>
            {children}
        </div>
    );
};