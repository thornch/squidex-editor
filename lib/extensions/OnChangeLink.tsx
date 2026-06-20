/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { useHelpers, useRemirrorContext, useUpdateReason } from '@remirror/react';
import * as React from 'react';
import { values } from 'remirror';
import { EditorProps, EditorValue } from '../props';
import { equals, isString } from '../utils';

export const OnChangeLink = (props: Pick<EditorProps, 'mode' | 'onChange' | 'value'>) => {
    const {
        mode,
        onChange,
        value,
    } = props;

    const { setContent, getState } = useRemirrorContext();
    const { getMarkdown, getHTML } = useHelpers();
    const valueCurrent = React.useRef<unknown>(null!);
    const valueWasSet = React.useRef(false);
    const updateCount = React.useRef<number>(0);
    const updateReason = useUpdateReason();
    const { doc } = getState();

    React.useEffect(() => {
        updateCount.current += 1;
    }, [updateReason]);

    React.useEffect(() => {
        valueWasSet.current = isSet(value);

        if (!equals(valueCurrent.current, value)) {
            valueCurrent.current = value;

            setContent((value || '') as never);

            // Reset the update count to prevent noop updates of the original value.
            updateCount.current = -1;
        }
    }, [setContent, value]);

    React.useEffect(() => {
        if (!onChange) {
            return;
        }

        function getExport(): EditorValue {
            switch (mode) {
                case 'Markdown':
                    return getMarkdown({ doc } as never);
                case 'Html': {
                    const raw = getHTML({ doc } as never);
                    // ProseMirror wraps list item content in <p>. Strip the sole
                    // <p> child of each <li> so the output is clean HTML.
                    return typeof raw === 'string' ? stripListItemParagraphs(raw) : raw;
                }
                default:
                    return doc;
            }
        }

        // There was no manual update since the last change.
        if (updateCount.current <= 0) {
            return;
        }

        let value = getExport();

        if (isString(value)) {
            value = clearValue(value);
        }

        if (valueCurrent.current === value) {
            return;
        }

        const isValueSet = isSet(value);

        if (!valueWasSet.current && !isValueSet) {
            onChange(undefined);
        } else {
            onChange(value);
        }

        valueCurrent.current = value;
        valueWasSet.current = isValueSet;
    }, [doc, mode, getHTML, getMarkdown, onChange]);

    return null;
};

function isSet(value: unknown) {
    return !!value && (!isString(value) || values.length > 0);
}

function clearValue(value: string) {
    value = value.trim();

    if (value && value.length > 0 && EMPTY_RESULTS.indexOf(value) >= 0) {
        value = '';
    }

    return value;
}

const EMPTY_RESULTS = [
    '<p></p>',
    '<p style=""></p>',
    '<p class=""></p>'
];

/**
 * ProseMirror wraps list-item content in a paragraph node, producing
 * <li><p>…</p></li>. Strip the wrapping <p> when it is the sole child
 * of a <li> so the persisted HTML is clean and predictable.
 */
function stripListItemParagraphs(html: string): string {
    try {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.querySelectorAll('li > p:only-child').forEach(p => {
            const li = p.parentElement!;
            while (p.firstChild) {
                li.insertBefore(p.firstChild, p);
            }
            li.removeChild(p);
        });
        return div.innerHTML;
    } catch {
        return html;
    }
}