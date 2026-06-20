/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { AssetImageParams, LinkClassEntry, LinkClassItem } from './utils/linkConfig';

export type { AssetImageParams, LinkClassEntry, LinkClassItem };
export type Asset = {
    // The alternative text of the image.
    alt?: string;

    // The src to the asset.
    src: string;

    // The mime type.
    mimeType: string;

    // The file name of the asset.
    fileName: string;
};

export type Content = {
    // The title of the content.
    id: string;

    // The name of the schema.
    schemaName: string;

    // The title of the content item.
    title: string;
};

type Node = object;

export type EditorValue = string | Node | undefined | null;

export type OnAnnotationCreate = (annotation: AnnotationSelection) => void;
export type OnAnnotationUpdate = (annotation: ReadonlyArray<Annotation>) => void;
export type OnAnnotationFocus = (annotation: ReadonlyArray<string>) => void;
export type OnAssetEdit = (id: string) => void;
export type OnAssetUpload = (images: UploadRequest[]) => DelayedPromiseCreator<Asset>[];
export type OnChange = (value: EditorValue) => void;
export type OnStateChange = (value: unknown) => void;
export type OnContentEdit = (schemaName: string, contentId: string) => void;
export type OnSelectAIText = () => Promise<string | undefined | null>;
export type OnSelectAssets = () => Promise<Asset[]>;
export type OnSelectContents = () => Promise<Content[]>;

export type ToolbarItem =
    | 'history'
    | 'headings'
    | 'textStyle'
    | 'blockStyle'
    | 'lists'
    | 'className'
    | 'link'
    | 'assets'
    | 'contents'
    | 'aiText'
    | 'annotation'
    | 'html'
    | 'table'
    | 'markupToggle';

/**
 * Called when the user changes the href in the link dialog.
 * Should return the list of anchor IDs/names found on the target page
 * (without the leading #). Return an empty array if none are available.
 * Returning null / undefined means the anchor picker will not be shown.
 */
export type LoadLinkAnchors = (href: string) => Promise<string[]>;

export type SquidexEditorMode = 'Html' | 'Markdown' | 'State';

export interface UploadRequest {
    // The file to upload.
    file: File;

    // The upload progress to update.
    progress: (progress: number) => void;
}

export interface EditorProps {
    // The mode of the editor.
    mode: SquidexEditorMode;

    // The incoming value.
    value?: EditorValue;

    // The base url.
    baseUrl: string;

    // The name to the app.
    appName: string;

    // The class names. Accepts plain strings (backward-compatible) or
    // structured entries (LinkClassItem / LinkClassGroup) for grouped display.
    classNames?: ReadonlyArray<string | LinkClassEntry>;

    // Called when the value has been changed.
    onChange?: OnChange;

    // Called when the state has been changed.
    onStateChange?: OnStateChange;

    // Called when AI text selected.
    onSelectAIText?: OnSelectAIText;

    // Called when assets are selected.
    onSelectAssets?: OnSelectAssets;

    // Called when content items should be selected.
    onSelectContents?: OnSelectContents;

    // Called when an asset is to be edited.
    onEditAsset: OnAssetEdit;

    // Called when a content is to be edited.
    onEditContent: OnContentEdit;

    // Called when a file needs to be uploaded.
    onUpload?: OnAssetUpload;

    // Triggered, when an annotation is clicked.
    onAnnotationsFocus?: OnAnnotationFocus;

    // Triggered, when an annotation are updated.
    onAnnotationsUpdate?: OnAnnotationUpdate;

    // Triggered, when an annotation is created.
    onAnnotationCreate?: OnAnnotationCreate;

    // True, if disabled.
    isDisabled?: boolean;

    // Indicates whether AI text can be selected.
    canSelectAIText?: boolean;

    // Indicates whether assets can be selected.
    canSelectAssets?: boolean;

    // Indicates whether content items can be selected.
    canSelectContents?: boolean;

    // Indicates whether annotations can be added.
    canAddAnnotation?: boolean;

    // Annotation
    annotations?: ReadonlyArray<Annotation> | null;

    // Pre-configured CSS class items for links.
    // When provided, the link dialog shows a class selector.
    // Supports flat items (LinkClassItem) and grouped entries (LinkClassGroup).
    linkClassNames?: ReadonlyArray<LinkClassEntry>;

    // Called when the user types/pastes a URL in the link dialog.
    // Receives the URL and should resolve to an array of anchor fragment
    // identifiers (without the leading #) found on the target page.
    // When not provided or when it returns an empty array the anchor
    // picker is hidden.
    loadLinkAnchors?: LoadLinkAnchors;

    // Controls whether the markup view is editable.
    // Default: true for Markdown mode, false for other modes.
    markupEditable?: boolean;

    // Toolbar items that should be hidden/disabled by configuration.
    disabledToolbarItems?: ReadonlyArray<ToolbarItem>;

    // URL of an additional stylesheet injected into the editor at runtime.
    customStylesheetUrl?: string;

    // Default query parameters for Squidex asset image URLs (e.g. mode, format, cache).
    // Shown as pre-filled fields in the image edit dialog; the user can override per image.
    assetImageParams?: AssetImageParams;
}

export interface AnnotationSelection {
    // The start of the annotation selection.
    from: number;

    // The end of the annotation selection.
    to: number;
}

export interface Annotation extends AnnotationSelection {
    // The ID of the annotation.
    id: string;
}

type DelayedPromiseCreator<T> = (context: unknown) => Promise<T>;