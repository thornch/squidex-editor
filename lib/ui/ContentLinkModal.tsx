/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CommandButton, CommandButtonGroup, useCommands, useRemirrorContext } from '@remirror/react';
import * as React from 'react';
import { LinkClassEntry, LoadLinkAnchors } from '../props';
import { isLinkClassGroup } from '../utils/linkConfig';
import { isValidUrl } from '../utils/links';
import { DelayedAutoFocusInput, Icon, Modal } from './internal';

const TARGET_OPTIONS = [
    { value: '', label: '– Default –' },
    { value: '_blank', label: '_blank (new tab)' },
    { value: '_self', label: '_self (same tab)' },
    { value: '_parent', label: '_parent' },
    { value: '_top', label: '_top' },
];

interface ContentLinkModalProps {
    nodePos: number;
    onClose: () => void;
    linkClassNames?: ReadonlyArray<LinkClassEntry>;
    loadLinkAnchors?: LoadLinkAnchors;
}

export const ContentLinkModal = (props: ContentLinkModalProps) => {
    const {
        nodePos,
        onClose,
        linkClassNames,
        loadLinkAnchors,
    } = props;

    const commands = useCommands();
    const { getState } = useRemirrorContext({ autoUpdate: true });

    const [href, setHref] = React.useState<string>('');
    const [target, setTarget] = React.useState<string>('');
    const [linkClass, setLinkClass] = React.useState<string>('');
    const [text, setText] = React.useState<string>('');
    const [anchor, setAnchor] = React.useState<string>('');
    const [anchors, setAnchors] = React.useState<string[]>([]);
    const [anchorsLoading, setAnchorsLoading] = React.useState(false);

    React.useEffect(() => {
        const state = getState();
        const node = state.doc.nodeAt(nodePos);

        if (!node) {
            onClose();
            return;
        }

        const existingHref = (node.attrs.href as string) ?? '';
        const hashIdx = existingHref.indexOf('#');
        const baseHref = hashIdx >= 0 ? existingHref.substring(0, hashIdx) : existingHref;
        const existingAnchor = hashIdx >= 0 ? existingHref.substring(hashIdx + 1) : '';

        setHref(baseHref);
        setTarget((node.attrs.target as string) ?? '');
        setLinkClass((node.attrs.linkClass as string) ?? '');
        setText((node.attrs.contentTitle as string) ?? '');
        setAnchor(existingAnchor);
        setAnchors([]);
    }, [getState, nodePos, onClose]);

    const reloadAnchors = React.useCallback(async () => {
        if (!loadLinkAnchors || !isValidUrl(href.trim())) {
            setAnchors([]);
            return;
        }

        setAnchorsLoading(true);

        try {
            const list = await loadLinkAnchors(href.trim());
            setAnchors(list ?? []);
        } catch {
            setAnchors([]);
        } finally {
            setAnchorsLoading(false);
        }
    }, [href, loadLinkAnchors]);

    // Auto-reload anchors: wait 300 ms after last keystroke and only if URL
    // is syntactically valid – avoids a request on every character typed.
    React.useEffect(() => {
        setAnchors([]);

        if (!loadLinkAnchors || !isValidUrl(href.trim())) {
            return;
        }

        const timer = setTimeout(() => {
            reloadAnchors();
        }, 300);

        return () => clearTimeout(timer);
    }, [href, loadLinkAnchors, reloadAnchors]);

    const submit = React.useCallback(() => {
        const state = getState();
        const node = state.doc.nodeAt(nodePos);

        if (!node) {
            onClose();
            return;
        }

        const base = href.trim();
        const hash = anchor.trim();
        const finalHref = hash ? `${base}#${hash}` : base;

        commands.updateNodeAttributes(nodePos, {
            ...node.attrs,
            contentTitle: text,
            href: finalHref,
            target: target || null,
            linkClass: linkClass || null,
        });

        onClose();
    }, [anchor, commands, getState, href, linkClass, nodePos, onClose, target, text]);

    const doSetHref = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setHref(event.target.value);
    }, []);

    const doSetText = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    }, []);

    const doKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Enter') {
            submit();
        }

        if (event.code === 'Escape') {
            onClose();
        }
    }, [onClose, submit]);

    const stopMouseDown = React.useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
    }, []);

    const showClassSelector = !!linkClassNames && linkClassNames.length > 0;
    const showAnchorPicker = !!loadLinkAnchors;

    return (
        <Modal title='Change Content Link'>
            <DelayedAutoFocusInput
                value={href}
                onChange={doSetHref}
                onKeyDown={doKeyDown}
                placeholder='Enter URL...'
            />

            <input
                className='squidex-editor-input'
                value={text}
                onChange={doSetText}
                onKeyDown={doKeyDown}
                placeholder='Display text...'
            />

            {showAnchorPicker && (
                <div className='squidex-editor-modal-anchor'>
                    {anchors.length > 0 ? (
                        <select
                            className='squidex-editor-input'
                            value={anchor}
                            onChange={e => setAnchor(e.target.value)}
                            onMouseDownCapture={stopMouseDown}
                            title='Anchor on target page'
                        >
                            <option value=''>– No anchor –</option>
                            {anchors.map(a => (
                                <option key={a} value={a}>#{a}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            className='squidex-editor-input'
                            value={anchor}
                            onChange={e => setAnchor(e.target.value)}
                            onKeyDown={doKeyDown}
                            placeholder={anchorsLoading ? 'Loading anchors…' : 'Anchor (optional, e.g. #section)'}
                            disabled={anchorsLoading}
                        />
                    )}

                    <button type='button' className='squidex-editor-modal-reload' onMouseDownCapture={stopMouseDown} onClick={() => reloadAnchors()}>
                        Reload
                    </button>
                </div>
            )}

            <div className='squidex-editor-modal-row'>
                <select
                    className='squidex-editor-input'
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    onMouseDownCapture={stopMouseDown}
                    title='Link target'
                >
                    {TARGET_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                {showClassSelector && (
                    <select
                        className='squidex-editor-input'
                        value={linkClass}
                        onChange={e => setLinkClass(e.target.value)}
                        onMouseDownCapture={stopMouseDown}
                        title='Link CSS class'
                    >
                        <option value=''>– No class –</option>
                        {linkClassNames!.map((entry, i) =>
                            isLinkClassGroup(entry) ? (
                                <optgroup key={i} label={entry.label}>
                                    {entry.items.map(item => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    ))}
                                </optgroup>
                            ) : (
                                <option key={entry.value} value={entry.value}>{entry.label}</option>
                            )
                        )}
                    </select>
                )}
            </div>

            <CommandButtonGroup>
                <CommandButton commandName='submitContentLink' enabled
                    onSelect={submit} icon={<Icon type='Check' />} />

                <CommandButton commandName='cancelContentLink' enabled
                    onSelect={onClose} icon={<Icon type='Cancel' />} />
            </CommandButtonGroup>
        </Modal>
    );
};
