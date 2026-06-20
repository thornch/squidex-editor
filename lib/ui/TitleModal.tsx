/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CommandButton, CommandButtonGroup, useCommands } from '@remirror/react';
import * as React from 'react';
import { AssetImageParams } from '../props';
import { EditableNode, useStateWithRef } from '../utils';
import { buildAssetUrl, parseAssetUrlParams } from '../utils/links';
import { DelayedAutoFocusInput, Icon, Modal } from './internal';

export const TitleModal = (props: { onClose: () => void; node: EditableNode; assetImageParams?: AssetImageParams }) => {
    const {
        onClose,
        node,
        assetImageParams,
    } = props;

    const [title, setTitle, titleRef] = useStateWithRef<string>('');
    const [width, setWidth, widthRef] = useStateWithRef<string>('');
    const [height, setHeight, heightRef] = useStateWithRef<string>('');
    // Extra URL params from config – all as strings, editable per image.
    const [urlParams, setUrlParams, urlParamsRef] = useStateWithRef<Record<string, string>>({});
    const cmd = useCommands();

    React.useEffect(() => {
        const src: string = node.node.attrs.src || '';
        const existing = parseAssetUrlParams(src);

        // Merge: config defaults first, then values already in the URL override.
        const merged: Record<string, string> = { ...assetImageParams, ...existing };

        setTitle(node.node.attrs.title || '');
        setWidth(merged['width'] ?? (node.node.attrs.width ? `${node.node.attrs.width}` : ''));
        setHeight(merged['height'] ?? (node.node.attrs.height ? `${node.node.attrs.height}` : ''));

        // Remaining params (all except width/height which have dedicated fields).
        const rest: Record<string, string> = {};

        for (const [k, v] of Object.entries(merged)) {
            if (k !== 'width' && k !== 'height') {
                rest[k] = v;
            }
        }

        setUrlParams(rest);
    }, [assetImageParams, node, setHeight, setTitle, setUrlParams, setWidth]);

    const doSetTitle = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }, [setTitle]);

    const submitTitle = React.useCallback(() => {
        const src: string = node.node.attrs.src || '';
        const allParams: Record<string, string> = { ...urlParamsRef.current };

        if (widthRef.current) allParams['width'] = widthRef.current;
        else delete allParams['width'];

        if (heightRef.current) allParams['height'] = heightRef.current;
        else delete allParams['height'];

        const newSrc = src ? buildAssetUrl(src, allParams) : src;

        cmd.updateNodeAttributes(node.getPos() || 0, {
            ...node.node.attrs,
            src: newSrc,
            title: titleRef.current,
            // Keep numeric attrs in sync for ProseMirror schema compatibility.
            width: widthRef.current || undefined,
            height: heightRef.current || undefined,
        });

        onClose();
    }, [cmd, heightRef, node, onClose, titleRef, urlParamsRef, widthRef]);

    const doSetWidth = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setWidth(event.target.value);
    }, [setWidth]);

    const doSetHeight = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setHeight(event.target.value);
    }, [setHeight]);

    const doSetUrlParam = React.useCallback((key: string, value: string) => {
        setUrlParams(prev => ({ ...prev, [key]: value }));
    }, [setUrlParams]);

    const doComplete = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        const { code } = event;

        if (code === 'Enter') {
            submitTitle();
        }

        if (code === 'Escape') {
            onClose();
        }
    }, [onClose, submitTitle]);

    // The extra params to render (everything except width + height).
    const extraParamKeys = Object.keys(urlParams);

    return (
        <Modal title='Change Image'>
            <DelayedAutoFocusInput
                value={title}
                onChange={doSetTitle}
                onKeyDown={doComplete}
                placeholder='Enter Title...'
            />

            <div className='squidex-editor-modal-row'>
                <input
                    className='squidex-editor-input'
                    value={width}
                    onChange={doSetWidth}
                    onKeyDown={doComplete}
                    placeholder='Width (px, optional)'
                />

                <input
                    className='squidex-editor-input'
                    value={height}
                    onChange={doSetHeight}
                    onKeyDown={doComplete}
                    placeholder='Height (px, optional)'
                />
            </div>

            {extraParamKeys.map(key => (
                <div key={key} className='squidex-editor-modal-row'>
                    <label className='squidex-editor-modal-param-label'>{key}</label>
                    <input
                        className='squidex-editor-input'
                        value={urlParams[key]}
                        onChange={e => doSetUrlParam(key, e.target.value)}
                        onKeyDown={doComplete}
                        placeholder={key}
                    />
                </div>
            ))}

            <CommandButtonGroup>
                <CommandButton commandName='submitLink' enabled
                    onSelect={submitTitle} icon={<Icon type='Check' />} />

                <CommandButton commandName='cancelLink' enabled
                    onSelect={onClose} icon={<Icon type='Cancel' />} />
            </CommandButtonGroup>
        </Modal>
    );
};