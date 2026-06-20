/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { NodeViewComponentProps, useCommands } from '@remirror/react';
import { OnSelectAssets } from '../props';
import { Icon } from '../ui/internal/Icon';
import { EditableNode, getAssetId } from '../utils';

export interface CustomImageViewProps {
    // The base url.
    baseUrl: string;

    // The name to the app.
    appName: string;

    // Called when the image is edited.
    onEditNode: (node: EditableNode) => void;

    // Called when the asset is edited.
    onEditAsset: (assetId: string) => void;

    // Called when the link around the image should be edited.
    onEditLink: (node: EditableNode) => void;

    // Opens the asset picker to replace the current image with a different one.
    // Only shown for Squidex asset images (src matches the asset URL pattern).
    onSelectAssets?: OnSelectAssets;
}

export const CustomImageView = (props: NodeViewComponentProps & CustomImageViewProps) => {
    const {
        appName,
        baseUrl,
        onEditNode,
        onEditAsset,
        onEditLink,
        onSelectAssets,
        node,
        getPosition: getPos
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commands = useCommands() as any;

    const asset = getAssetId(node.attrs.src, baseUrl, appName);

    const doReplaceAsset = async () => {
        if (!onSelectAssets) return;

        const assets = await onSelectAssets();
        const picked = assets.find(a => a.mimeType.startsWith('image/'));

        if (!picked) return;

        const pos = getPos?.();

        if (typeof pos !== 'number') return;

        commands.updateNodeAttributes(pos, {
            src: picked.src,
            alt: picked.alt ?? node.attrs.alt,
            title: picked.fileName ?? node.attrs.title,
        });
    };

    return (
        <div style={{ position: 'relative' }} className='squidex-editor-image-view'>
            <img className='squidex-editor-image-element' src={node.attrs.src} />

            <div className='squidex-editor-image-buttons'>
                <button type='button' className='squidex-editor-button' onClick={() => onEditNode({ node, getPos })}>
                    <Icon type='Edit' />
                </button>

                {asset &&
                    <button type='button' className='squidex-editor-button' onClick={() => onEditLink({ node, getPos })}>
                        <Icon type='Link' />
                    </button>
                }

                {asset && onSelectAssets &&
                    <button type='button' className='squidex-editor-button' title='Replace image' onClick={doReplaceAsset}>
                        <Icon type='Replace' />
                    </button>
                }

                {asset &&
                    <button type='button' className='squidex-editor-button' onClick={() => onEditAsset(asset.id)}>
                        <Icon type='Assets' />
                    </button>
                }
            </div>


            {asset &&
                <div className='squidex-editor-image-info'>
                    Asset
                </div>
            }
        </div>
    );
};