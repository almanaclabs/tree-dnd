import { Component, ReactNode } from 'react';
import { Props, State, DragState } from './Tree-types';
import { FlattenedItem, ItemId, Path, TreeData } from '../../types';
import DelayedFunction from '../../utils/delayed-function';
export default class Tree extends Component<Props, State> {
    static defaultProps: {
        tree: {
            children: any[];
        };
        onExpand: () => void;
        onCollapse: () => void;
        onDragStart: () => void;
        onDragEnd: () => void;
        renderItem: () => void;
        offsetPerLevel: number;
        isDragEnabled: boolean;
        isNestingEnabled: boolean;
        dropPlaceholder: any;
    };
    state: {
        flattenedTree: any[];
        draggedItemId: any;
        dropPlaceholderAttrs: any;
        horizontalLevel: any;
    };
    dragState?: DragState;
    itemsElement: Record<ItemId, HTMLElement | undefined>;
    containerElement: HTMLElement | undefined;
    expandTimer: DelayedFunction;
    static getDerivedStateFromProps(props: Props, state: State): {
        flattenedTree: FlattenedItem[];
        draggedItemId?: ItemId;
        dropPlaceholderAttrs?: {
            top: number;
            left: number;
            width: number;
            height: number;
        };
        horizontalLevel?: number;
    };
    static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData;
    dropPlaceholderPos: (draggableId: ItemId, sourceIdx: number, destinationIdx?: number) => {
        top: number;
        left: number;
        height: number;
        width: number;
    };
    onDragStart: (result: any) => void;
    onDragUpdate: (update: any) => void;
    onDropAnimating: () => void;
    onDragEnd: (result: any) => void;
    onPointerMove: () => void;
    calculateEffectivePath: (flatItem: FlattenedItem, snapshot: any) => Path;
    isExpandable: (item: FlattenedItem) => boolean;
    getDroppedLevel: () => number | undefined;
    patchDroppableProvided: (provided: any) => any;
    setItemRef: (itemId: ItemId, el: HTMLElement | null) => void;
    renderItems: () => Array<ReactNode>;
    renderItem: (flatItem: FlattenedItem, index: number) => ReactNode;
    renderDraggableItem: (flatItem: FlattenedItem) => (provided: any, snapshot: any) => JSX.Element;
    render(): JSX.Element;
}
