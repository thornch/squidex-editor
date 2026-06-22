/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { CodeBlockLanguageSelect } from '@remirror/extension-react-language-select';
import { CommandButton, CommandButtonGroup, CreateTableButton, EditorComponent, HeadingLevelButtonGroup, HistoryButtonGroup, InsertHorizontalRuleButton, NodeViewComponentProps, Remirror, TableComponents, ThemeProvider, ToggleBlockquoteButton, ToggleBoldButton, ToggleBulletListButton, ToggleCodeBlockButton, ToggleCodeButton, ToggleItalicButton, ToggleOrderedListButton, ToggleUnderlineButton, Toolbar, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import * as React from 'react';
import { cx, ExtensionCodeBlockTheme } from 'remirror';
import { CustomImageView, OnChangeLink, useEditorExtensions } from './extensions';
import { EditorProps, ToolbarItem } from './props';
import { AddAITextButton, AddAssetsButton, AddContentsButton, AddHtmlButton, AnnotateButton, AnnotationView, ContentLinkModal, Counter, FocusHandler, LinkButtons, LinkModal, MarkupView, TitleModal, ToolbarWrapper } from './ui';
import { Icon } from './ui/internal';
import { EditableNode, stripHtmlFormatting, useStoredBoolean } from './utils';
import './Editor.scss';

export const Editor = (props: EditorProps) => {
    const {
        annotations,
        appName,
        canAddAnnotation,
        canSelectAIText,
        canSelectAssets,
        canSelectContents,
        classNames,
        isDisabled,
        linkClassNames,
        loadLinkAnchors,
        mode,
        markupEditable,
        disabledToolbarItems,
        customStylesheetUrl,
        assetImageParams,
        onAnnotationCreate,
        onAnnotationsFocus,
        onAnnotationsUpdate,
        onChange,
        onEditAsset,
        onEditContent,
        onSelectAIText,
        onSelectAssets,
        onSelectContents,
        onUpload,
        value,
    } = props;

    const baseUrl = React.useMemo(() => {
        let result = props.baseUrl;

        if (result.endsWith('/')) {
            result = result.substring(0, result.length - 1);
        }

        return result;
    }, [props.baseUrl]);

    const [modalTitle, setModalTitle] = React.useState<EditableNode | undefined | null>();
    const [modalAssetLinkNode, setModalAssetLinkNode] = React.useState<EditableNode | undefined>();
    const [modalContentLinkPos, setModalContentLinkPos] = React.useState<number | undefined>();
    const [modalLink, setModalLink] = React.useState<boolean>(false);
    const [markup, setMarkup] = React.useState<boolean>(false);
    const [markupContent, setMarkupContent] = React.useState<string>('');
    const markupContentRef = React.useRef('');
    const [toolbar, setToolbar] = useStoredBoolean('toolbar');

    const isMarkupEditable = markupEditable ?? mode === 'Markdown';

    // Inject an optional custom stylesheet at runtime. The <link> element is
    // created on mount (or when the URL changes) and removed on cleanup so
    // it does not accumulate across re-renders or editor instances.
    React.useEffect(() => {
        if (!customStylesheetUrl) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = customStylesheetUrl;
        link.setAttribute('data-squidex-editor-custom', '1');
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, [customStylesheetUrl]);

    const isToolbarItemDisabled = React.useCallback((item: ToolbarItem) => {
        return !!disabledToolbarItems?.includes(item);
    }, [disabledToolbarItems]);

    const doOpenModalLink = React.useCallback(() => {
        setModalLink(true);
    }, []);

    const doOpenModalLinkForNode = React.useCallback((node: EditableNode) => {
        setModalAssetLinkNode(node);
        setModalLink(true);
    }, []);

    const doOpenModalContentLink = React.useCallback((pos: number) => {
        setModalContentLinkPos(pos);
    }, []);

    const extensions = useEditorExtensions({
        appName,
        baseUrl,
        canSelectContents,
        classNames,
        mode,
        onEditContent,
        onOpenContentLinkModal: doOpenModalContentLink,
        onSelectContents,
        onUpload,
    });

    const doCloseModalLink = React.useCallback(() => {
        setModalLink(false);
    }, []);

    const doCloseModalContentLink = React.useCallback(() => {
        setModalContentLinkPos(undefined);
    }, []);

    const doCloseModalTitle = React.useCallback(() => {
        setModalTitle(null);
    }, []);

    // doToggleMarkup is defined after useRemirror so it can access getContext.
    const { manager, getContext } = useRemirror({
        stringHandler: mode === 'Markdown' ? 'markdown' : 'html',
        selection: 'start',
        content: value as never,
        nodeViewComponents: {
            'image': (props: NodeViewComponentProps) => (
                <CustomImageView {...props}
                    appName={appName}
                    baseUrl={baseUrl}
                    onEditLink={doOpenModalLinkForNode}
                    onEditNode={setModalTitle}
                    onEditAsset={onEditAsset}
                    onSelectAssets={canSelectAssets ? onSelectAssets : undefined}
                />
            ),
        },
        extensions,
    });

    React.useEffect(() => {
        if (!modalAssetLinkNode || !modalLink) {
            return;
        }

        const pos = modalAssetLinkNode.getPos();

        if (typeof pos === 'number') {
            const from = pos;
            const to = pos + modalAssetLinkNode.node.nodeSize;

            getContext()?.commands.selectText({ from, to });
        }

        setModalAssetLinkNode(undefined);
    }, [getContext, modalAssetLinkNode, modalLink]);

    // Track markup text changes without calling setContent on every keystroke.
    const doMarkupChange = React.useCallback((text: string) => {
        markupContentRef.current = text;
    }, []);

    // Stops click / mousedown inside MarkupView from bubbling to FocusHandler
    // which would call commands.focus() and steal focus away from Ace editor.
    const stopMarkupEvent = React.useCallback((e: React.SyntheticEvent) => {
        e.stopPropagation();
    }, []);

    // Toggle markup view: pull fresh content from remirror on open;
    // apply edited content back to remirror on close.
    const doToggleMarkup = React.useCallback(() => {
        if (!markup) {
            let content = '';

            try {
                const ctx = getContext();

                if (ctx) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const h = ctx.helpers as any;
                    const doc = ctx.getState().doc;

                    if (mode === 'Markdown') {
                        content = h.getMarkdown?.({ doc } as never) || h.getMarkdown?.() || '';
                    } else {
                        content = h.getHTML?.({ doc } as never) || h.getHTML?.() || '';
                    }
                }
            } catch {
                // helpers unavailable – fall through to value fallback
            }

            // Fallback: use the last known serialized value from the editor prop
            if (!content && typeof value === 'string') {
                content = value;
            }

            markupContentRef.current = content;
            setMarkupContent(content);
        } else if (isMarkupEditable && markupContentRef.current) {
            let content = markupContentRef.current;

            if (mode === 'Html') {
                // Normalize HTML: strip indentation whitespace added by the
                // Ace formatter so ProseMirror doesn't create spurious text nodes.
                content = stripHtmlFormatting(content);
            }

            getContext()?.setContent(content as never);
        }

        setMarkup(x => !x);
    }, [getContext, isMarkupEditable, markup, mode, value]);
    return (
        <AllStyledComponent>
            <ThemeProvider theme={{
                color: {
                    primary: '#3389ff',
                    active: {
                        primary: '#3389ff'
                    }
                }
            }}>
                <Remirror classNames={isDisabled ? ['squidex-editor-disabled'] : []} manager={manager}>
                    <div className='squidex-editor-menu'>
                        <Toolbar>
                            <fieldset className='squidex-editor-menu-group' disabled={markup || isDisabled}>
                                {!isToolbarItemDisabled('history') && <HistoryButtonGroup />}

                                {!isToolbarItemDisabled('headings') && <HeadingLevelButtonGroup showAll />}

                                {!isToolbarItemDisabled('textStyle') && (
                                    <CommandButtonGroup>
                                        <ToggleBoldButton />
                                        <ToggleItalicButton />
                                        <ToggleUnderlineButton />
                                        <ToggleCodeButton />
                                    </CommandButtonGroup>
                                )}

                                {!isToolbarItemDisabled('blockStyle') && (
                                    <CommandButtonGroup>
                                        <ToggleBlockquoteButton />
                                        <ToggleCodeBlockButton />

                                        <InsertHorizontalRuleButton />
                                    </CommandButtonGroup>
                                )}

                                {!isToolbarItemDisabled('lists') && (
                                    <CommandButtonGroup>
                                        <ToggleBulletListButton />
                                        <ToggleOrderedListButton />
                                    </CommandButtonGroup>
                                )}

                                {!isToolbarItemDisabled('link') && (
                                    <CommandButtonGroup>
                                        <LinkButtons onEdit={doOpenModalLink} />
                                    </CommandButtonGroup>
                                )}

                                <CommandButtonGroup>
                                    {!isToolbarItemDisabled('assets') && canSelectAssets && onSelectAssets &&
                                        <AddAssetsButton onSelectAssets={onSelectAssets} />
                                    }

                                    {!isToolbarItemDisabled('contents') && canSelectContents && onSelectContents &&
                                        <AddContentsButton onSelectContents={onSelectContents} />
                                    }

                                    {!isToolbarItemDisabled('aiText') && canSelectAIText && onSelectAIText &&
                                        <AddAITextButton onSelectAIText={onSelectAIText} />
                                    }
                                </CommandButtonGroup>

                                {!isToolbarItemDisabled('annotation') && canAddAnnotation && onAnnotationCreate &&
                                    <CommandButtonGroup>
                                        <AnnotateButton onAnnotationCreate={onAnnotationCreate} />
                                    </CommandButtonGroup>
                                }

                                {!isToolbarItemDisabled('html') && mode !== 'Markdown' &&
                                    <CommandButtonGroup>
                                        <AddHtmlButton />
                                    </CommandButtonGroup>
                                }

                                {!isToolbarItemDisabled('table') && mode !== 'Markdown' &&
                                    <CommandButtonGroup>
                                        <CreateTableButton />
                                    </CommandButtonGroup>
                                }
                            </fieldset>

                            {!isToolbarItemDisabled('markupToggle') && (
                                <fieldset className='squidex-editor-menu-group'>
                                    <CommandButtonGroup>
                                        {isMarkupEditable ? (
                                            <CommandButton commandName='toggleMarkup' enabled onSelect={doToggleMarkup} label='Show Markup (editable)'
                                                icon={<Icon type='Edit' />} />
                                        ) : (
                                            <CommandButton commandName='toggleMarkup' enabled onSelect={doToggleMarkup} label='Show Markup (readonly)'
                                                icon={<Icon type='Preview' />} />
                                        )}
                                    </CommandButtonGroup>
                                </fieldset>
                            )}
                        </Toolbar>
                    </div>

                    <FocusHandler className='squidex-editor-main'>
                        <div>
                            <OnChangeLink mode={mode} onChange={onChange} value={value} />

                            <EditorComponent />

                            {/* Table cell-level controls (column/row insert/delete menu) */}
                            {mode !== 'Markdown' && <TableComponents />}

                            {markup ? (
                                // onMouseDown + onClick stop FocusHandler from calling
                                // commands.focus() when the user interacts with Ace editor.
                                <div onMouseDown={stopMarkupEvent} onClick={stopMarkupEvent}>
                                    <MarkupView value={markupContent} mode={mode} editable={isMarkupEditable} onChange={doMarkupChange} />
                                </div>
                            ) : (
                                <>
                                    {modalLink ? (
                                        <LinkModal
                                            onClose={doCloseModalLink}
                                            linkClassNames={linkClassNames}
                                            loadLinkAnchors={loadLinkAnchors}
                                        />
                                    ) : typeof modalContentLinkPos === 'number' ? (
                                        <ContentLinkModal
                                            nodePos={modalContentLinkPos}
                                            onClose={doCloseModalContentLink}
                                            linkClassNames={linkClassNames}
                                            loadLinkAnchors={loadLinkAnchors}
                                        />
                                    ) : modalTitle ? (
                                        <TitleModal node={modalTitle} onClose={doCloseModalTitle} assetImageParams={assetImageParams} />
                                    ) : toolbar ? (
                                        <ToolbarWrapper onLinkModal={doOpenModalLink} isToolbarItemDisabled={isToolbarItemDisabled} />
                                    ) : null}

                                    <CodeBlockLanguageSelect
                                        offset={{ x: 5, y: 5 }}
                                        className={cx(
                                            ExtensionCodeBlockTheme.LANGUAGE_SELECT_POSITIONER,
                                            ExtensionCodeBlockTheme.LANGUAGE_SELECT_WIDTH,
                                        )}
                                    />

                                    <AnnotationView
                                        annotations={annotations}
                                        onAnnotationsFocus={onAnnotationsFocus}
                                        onAnnotationsUpdate={onAnnotationsUpdate}
                                    />
                                </>
                            )}
                        </div>
                    </FocusHandler>

                    <div className='squidex-editor-counter'>
                        <label>
                            <input type="checkbox" checked={toolbar} onChange={ev => setToolbar(ev.target.checked)} />

                            Floating Toolbar
                        </label>

                        <Counter />
                    </div>
                </Remirror>
            </ThemeProvider>
        </AllStyledComponent>
    );
};