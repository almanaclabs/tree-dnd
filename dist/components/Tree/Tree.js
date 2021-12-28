var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd-next';
import { getBox } from 'css-box-model';
import { calculateFinalDropPositions } from './Tree-utils';
import { noop } from '../../utils/handy';
import { flattenTree, mutateTree } from '../../utils/tree';
import TreeItem from '../TreeItem';
import { getDestinationPath, getItemById, getIndexById, } from '../../utils/flat-tree';
import DelayedFunction from '../../utils/delayed-function';
function elementBox(el) {
    if (!el)
        return undefined;
    var _a = getBox(el).marginBox, top = _a.top, left = _a.left, height = _a.height, width = _a.width;
    return { top: top, left: left, height: height, width: width };
}
function dropPlaceholderPos(root, draggable, index) {
    var children = Array.from(root.children);
    var _a = getBox(root).marginBox, left = _a.left, rootTop = _a.top;
    var top = children
        .slice(0, index)
        .reduce(function (acc, child) { return acc + getBox(child).marginBox.height; }, rootTop);
    var _b = getBox(draggable).marginBox, height = _b.height, width = _b.width;
    return { top: top, left: left, height: height, width: width };
}
var Tree = /** @class */ (function (_super) {
    __extends(Tree, _super);
    function Tree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            flattenedTree: [],
            draggedItemId: undefined,
            dropPlaceholder: undefined,
        };
        // HTMLElement for each rendered item
        _this.itemsElement = {};
        _this.expandTimer = new DelayedFunction(500);
        _this.onDragStart = function (result) {
            var onDragStart = _this.props.onDragStart;
            _this.dragState = {
                source: result.source,
                destination: result.source,
                mode: result.mode,
            };
            _this.setState({
                draggedItemId: result.draggableId,
                dropPlaceholder: dropPlaceholderPos(_this.containerElement, _this.itemsElement[result.draggableId], result.source.index)
            });
            if (onDragStart) {
                onDragStart(result.draggableId);
            }
        };
        _this.onDragUpdate = function (update) {
            var onExpand = _this.props.onExpand;
            var flattenedTree = _this.state.flattenedTree;
            if (!_this.dragState) {
                return;
            }
            _this.expandTimer.stop();
            if (update.destination) {
                _this.setState({
                    dropPlaceholder: dropPlaceholderPos(_this.containerElement, _this.itemsElement[update.draggableId], update.destination.index)
                });
            }
            if (update.combine) {
                var draggableId_1 = update.combine.draggableId;
                var item_1 = getItemById(flattenedTree, draggableId_1);
                _this.setState({
                    dropPlaceholder: elementBox(_this.itemsElement[draggableId_1])
                });
                if (item_1 && _this.isExpandable(item_1)) {
                    _this.expandTimer.start(function () { return onExpand(draggableId_1, item_1.path); });
                }
            }
            _this.dragState = __assign(__assign({}, _this.dragState), { destination: update.destination, combine: update.combine });
        };
        _this.onDropAnimating = function () {
            _this.expandTimer.stop();
        };
        _this.onDragEnd = function (result) {
            var _a = _this.props, onDragEnd = _a.onDragEnd, tree = _a.tree;
            var flattenedTree = _this.state.flattenedTree;
            _this.expandTimer.stop();
            var finalDragState = __assign(__assign({}, _this.dragState), { source: result.source, destination: result.destination, combine: result.combine });
            _this.setState({
                draggedItemId: undefined,
                dropPlaceholder: undefined,
            });
            var _b = calculateFinalDropPositions(tree, flattenedTree, finalDragState), sourcePosition = _b.sourcePosition, destinationPosition = _b.destinationPosition;
            onDragEnd(sourcePosition, destinationPosition);
            _this.dragState = undefined;
        };
        _this.onPointerMove = function () {
            if (_this.dragState) {
                _this.dragState = __assign(__assign({}, _this.dragState), { horizontalLevel: _this.getDroppedLevel() });
            }
        };
        _this.calculateEffectivePath = function (flatItem, snapshot) {
            var _a = _this.state, flattenedTree = _a.flattenedTree, draggedItemId = _a.draggedItemId;
            if (_this.dragState &&
                draggedItemId === flatItem.item.id &&
                (_this.dragState.destination || _this.dragState.combine)) {
                var _b = _this.dragState, source = _b.source, destination = _b.destination, combine = _b.combine, horizontalLevel = _b.horizontalLevel, mode = _b.mode;
                // We only update the path when it's dragged by keyboard or drop is animated
                if (mode === 'SNAP' || snapshot.isDropAnimating) {
                    if (destination) {
                        // Between two items
                        return getDestinationPath(flattenedTree, source.index, destination.index, horizontalLevel);
                    }
                    if (combine) {
                        // Hover on other item while dragging
                        return getDestinationPath(flattenedTree, source.index, getIndexById(flattenedTree, combine.draggableId), horizontalLevel);
                    }
                }
            }
            return flatItem.path;
        };
        _this.isExpandable = function (item) {
            return !!item.item.hasChildren && !item.item.isExpanded;
        };
        _this.getDroppedLevel = function () {
            var offsetPerLevel = _this.props.offsetPerLevel;
            var draggedItemId = _this.state.draggedItemId;
            if (!_this.dragState || !_this.containerElement) {
                return undefined;
            }
            var containerLeft = getBox(_this.containerElement).contentBox.left;
            var itemElement = _this.itemsElement[draggedItemId];
            if (itemElement) {
                var currentLeft = getBox(itemElement).contentBox.left;
                var relativeLeft = Math.max(currentLeft - containerLeft, 0);
                return (Math.floor((relativeLeft + offsetPerLevel / 2) / offsetPerLevel) + 1);
            }
            return undefined;
        };
        _this.patchDroppableProvided = function (provided) {
            return __assign(__assign({}, provided), { innerRef: function (el) {
                    _this.containerElement = el;
                    provided.innerRef(el);
                } });
        };
        _this.setItemRef = function (itemId, el) {
            if (!!el) {
                _this.itemsElement[itemId] = el;
            }
        };
        _this.renderItems = function () {
            var flattenedTree = _this.state.flattenedTree;
            return flattenedTree.map(_this.renderItem);
        };
        _this.renderItem = function (flatItem, index) {
            var isDragEnabled = _this.props.isDragEnabled;
            var isDragDisabled = typeof isDragEnabled === 'function'
                ? !isDragEnabled(flatItem.item)
                : !isDragEnabled;
            return (React.createElement(Draggable, { key: flatItem.item.id, draggableId: flatItem.item.id.toString(), index: index, isDragDisabled: isDragDisabled }, _this.renderDraggableItem(flatItem)));
        };
        _this.renderDraggableItem = function (flatItem) { return function (provided, snapshot) {
            var _a = _this.props, renderItem = _a.renderItem, onExpand = _a.onExpand, onCollapse = _a.onCollapse, offsetPerLevel = _a.offsetPerLevel;
            var currentPath = _this.calculateEffectivePath(flatItem, snapshot);
            if (snapshot.isDropAnimating) {
                _this.onDropAnimating();
            }
            return (React.createElement(TreeItem, { key: flatItem.item.id, item: flatItem.item, path: currentPath, onExpand: onExpand, onCollapse: onCollapse, renderItem: renderItem, provided: provided, snapshot: snapshot, itemRef: _this.setItemRef, offsetPerLevel: offsetPerLevel }));
        }; };
        return _this;
    }
    Tree.getDerivedStateFromProps = function (props, state) {
        var draggedItemId = state.draggedItemId;
        var tree = props.tree;
        var finalTree = Tree.closeParentIfNeeded(tree, draggedItemId);
        var flattenedTree = flattenTree(finalTree);
        return __assign(__assign({}, state), { flattenedTree: flattenedTree });
    };
    Tree.closeParentIfNeeded = function (tree, draggedItemId) {
        if (!!draggedItemId) {
            // Closing parent internally during dragging, because visually we can only move one item not a subtree
            return mutateTree(tree, draggedItemId, {
                isExpanded: false,
            });
        }
        return tree;
    };
    Tree.prototype.render = function () {
        var _this = this;
        var _a = this.props, isNestingEnabled = _a.isNestingEnabled, dropPlaceholderClassName = _a.dropPlaceholderClassName;
        var dropPlaceholder = this.state.dropPlaceholder;
        var renderedItems = this.renderItems();
        return (React.createElement(DragDropContext, { onDragStart: this.onDragStart, onDragEnd: this.onDragEnd, onDragUpdate: this.onDragUpdate },
            React.createElement(Droppable, { droppableId: "tree", isCombineEnabled: isNestingEnabled, ignoreContainerClipping: true }, function (provided, snapshot) {
                var finalProvided = _this.patchDroppableProvided(provided);
                return (React.createElement("div", __assign({ ref: finalProvided.innerRef, style: { pointerEvents: 'auto' }, onTouchMove: _this.onPointerMove, onMouseMove: _this.onPointerMove }, finalProvided.droppableProps),
                    renderedItems,
                    provided.placeholder,
                    dropPlaceholder && snapshot.isDraggingOver && (React.createElement("div", { className: dropPlaceholderClassName, style: {
                            top: dropPlaceholder.top,
                            left: dropPlaceholder.left,
                            height: dropPlaceholder.height,
                            width: dropPlaceholder.width,
                            position: 'fixed'
                        } }))));
            })));
    };
    Tree.defaultProps = {
        tree: { children: [] },
        onExpand: noop,
        onCollapse: noop,
        onDragStart: noop,
        onDragEnd: noop,
        renderItem: noop,
        offsetPerLevel: 35,
        isDragEnabled: false,
        isNestingEnabled: false,
        dropPlaceholderClassName: '',
    };
    return Tree;
}(Component));
export default Tree;
