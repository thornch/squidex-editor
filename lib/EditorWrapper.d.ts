/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

declare class EditorWrapper {
    constructor(element: HTMLElement, props: EditorProps);

    update(newProps: Partial<EditorProps>): void;

    setValue(value: EditorValue): void;

    setIsDisabled(isDisabled: boolean): void;

    setAnnotations(annotations?: ReadonlyArray<Annotation> | null): void;

    destroy(): void;
}

type EditorValue = string | Node | undefined | null;

/** Key-value map of Squidex image URL query parameters. */
type AssetImageParams = Record<string, string>;

type Asset = {
    // The alternative text of the image.
    alt?: string;

    // The src to the asset.
    src: string;

    // The mime type.
    mimeType: string;

    // The file name of the asset.
    fileName: string;
};

type Content = {
    // The title of the content.
    id: string;

    // The name of the schema.
    schemaName: string;

    // The title of the content item.
    title: string;
};

type OnAnnotationCreate = (annotation: AnnotationSelection) => void;
type OnAnnotationUpdate = (annotation: ReadonlyArray<Annotation>) => void;
type OnAnnotationFocus = (annotation: ReadonlyArray<string>) => void;
type OnAssetEdit = (id: string) => void;
type OnAssetUpload = (images: UploadRequest[]) => DelayedPromiseCreator<Asset>[];
type OnChange = (value: EditorValue) => void;
type OnContentEdit = (schemaName: string, contentId: string) => void;
type OnSelectAIText = () => Promise<string | undefined | null>;
type OnSelectAssets = () => Promise<Asset[]>;
type OnSelectContents = () => Promise<Content[]>;

type LinkClassItem = {
    label: string;
    value: string;
};

type LinkClassGroup = {
    label: string;
    items: LinkClassItem[];
};

type LinkClassEntry = LinkClassItem | LinkClassGroup;

type LoadLinkAnchors = (href: string) => Promise<string[]>;

type ToolbarItem =
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

type SquidexEditorMode = 'Html' | 'Markdown' | 'State';

interface UploadRequest {
    // The file to upload.
    file: File;

    // The upload progress to update.
    progress: (progress: number) => void;
}

interface EditorProps {
    // The mode of the editor.
    mode: SquidexEditorMode;

    // The incoming value.
    value?: EditorValue;

    // The base url.
    baseUrl: string;

    // The name to the app.
    appName: string;

    // The class names. Accepts plain strings or structured LinkClassEntry groups.
    classNames?: ReadonlyArray<string | LinkClassEntry>;

    // Called when the value has been changed.
    onChange?: OnChange;

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

    // The annotations.
    annotations?: ReadonlyArray<Annotation> | null;

    // Pre-configured CSS class items for links.
    linkClassNames?: ReadonlyArray<LinkClassEntry>;

    // Called when the user changes the href in the link dialog.
    loadLinkAnchors?: LoadLinkAnchors;

    // Controls whether the markup view is editable.
    markupEditable?: boolean;

    // Toolbar items that should be hidden/disabled by configuration.
    disabledToolbarItems?: ReadonlyArray<ToolbarItem>;

    // URL of an additional stylesheet injected into the editor at runtime.
    customStylesheetUrl?: string;

    // Default query parameters for Squidex asset image URLs.
    assetImageParams?: AssetImageParams;
}

interface AnnotationSelection {
    // The start of the annotation selection.
    from: number;

    // The end of the annotation selection.
    to: number;
}

interface Annotation extends AnnotationSelection {
    // The ID of the annotation.
    id: string;
}

type DelayedPromiseCreator<T> = (context: unknown) => Promise<T>;