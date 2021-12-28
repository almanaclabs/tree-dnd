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
        dropPlaceholderClassName: string;
    };
    state: {
        flattenedTree: any[];
        draggedItemId: any;
        dropPlaceholder: any;
    };
    dragState?: DragState;
    itemsElement: Record<ItemId, HTMLElement | undefined>;
    containerElement: HTMLElement | undefined;
    expandTimer: DelayedFunction;
    static getDerivedStateFromProps(props: Props, state: State): {
        flattenedTree: FlattenedItem[];
        draggedItemId?: ItemId;
        dropPlaceholder?: {
            top: number;
            left: number;
            width: number;
            height: number;
        };
    };
    static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData;
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
