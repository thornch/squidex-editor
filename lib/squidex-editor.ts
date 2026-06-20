/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { flattenLinkClassItems } from './utils/linkConfig';
import { EditorWrapper } from '.';

export { EditorWrapper as SquidexEditorWrapper };
export { flattenLinkClassItems as SquidexEditorFlattenLinkClassItems };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;
w.SquidexEditorWrapper = EditorWrapper;
w.SquidexEditorFlattenLinkClassItems = flattenLinkClassItems;