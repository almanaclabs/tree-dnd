"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_beautiful_dnd_next_1 = require("react-beautiful-dnd-next");
var css_box_model_1 = require("css-box-model");
var Tree_utils_1 = require("./Tree-utils");
var handy_1 = require("../../utils/handy");
var tree_1 = require("../../utils/tree");
var TreeItem_1 = __importDefault(require("../TreeItem"));
var flat_tree_1 = require("../../utils/flat-tree");
var delayed_function_1 = __importDefault(require("../../utils/delayed-function"));
var Tree = /** @class */ (function (_super) {
    __extends(Tree, _super);
    function Tree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            flattenedTree: [],
            draggedItemId: undefined,
            dropPlaceholderAttrs: undefined,
            horizontalLevel: undefined,
        };
        // HTMLElement for each rendered item
        _this.itemsElement = {};
        _this.expandTimer = new delayed_function_1.default(500);
        _this.dropPlaceholderPos = function (draggableId, sourceIdx, destinationIdx) {
            if (destinationIdx === void 0) { destinationIdx = undefined; }
            // skip unnecessary routine
            if (!_this.props.renderDropPlaceholder)
                return undefined;
            var draggable = _this.itemsElement[draggableId];
            if (destinationIdx === undefined) {
                var _a = css_box_model_1.getBox(draggable).borderBox, top_1 = _a.top, height_1 = _a.height;
                var _b = css_box_model_1.getBox(draggable.parentElement).borderBox, left_1 = _b.left, width_1 = _b.width;
                return { top: top_1, left: left_1, height: height_1, width: width_1 };
            }
            var children = Array.from(_this.containerElement.children);
            children.splice(sourceIdx, 1);
            var _c = css_box_model_1.getBox(_this.containerElement).marginBox, left = _c.left, rootTop = _c.top;
            var top = children
                .slice(0, destinationIdx)
                .reduce(function (acc, child) { return acc + css_box_model_1.getBox(child).marginBox.height; }, rootTop);
            var extraMargin = css_box_model_1.getBox(children[destinationIdx]).margin;
            var _d = css_box_model_1.getBox(draggable).marginBox, height = _d.height, width = _d.width;
            return { top: top + extraMargin.top + extraMargin.bottom, left: left, height: height, width: width };
        };
        _this.onDragStart = function (result) {
            var onDragStart = _this.props.onDragStart;
            _this.dragState = {
                source: result.source,
                destination: result.source,
                mode: result.mode,
            };
            _this.setState({
                draggedItemId: result.draggableId,
                dropPlaceholderAttrs: _this.dropPlaceholderPos(result.draggableId, result.source.index, result.source.index)
            });
            if (onDragStart) {
                onDragStart(result.draggableId);
            }
        };
        _this.onDragUpdate = function (update) {
            var _a = _this.props, onExpand = _a.onExpand, tree = _a.tree;
            var flattenedTree = _this.state.flattenedTree;
            if (!_this.dragState) {
                return;
            }
            _this.expandTimer.stop();
            if (update.destination) {
                _this.setState({
                    dropPlaceholderAttrs: _this.dropPlaceholderPos(update.draggableId, update.source.index, update.destination.index)
                });
            }
            if (update.combine) {
                var draggableId_1 = update.combine.draggableId;
                var item_1 = flat_tree_1.getItemById(flattenedTree, draggableId_1);
                _this.setState({
                    dropPlaceholderAttrs: _this.dropPlaceholderPos(draggableId_1, update.source.index)
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
                dropPlaceholderAttrs: undefined,
            });
            var _b = Tree_utils_1.calculateFinalDropPositions(tree, flattenedTree, finalDragState), sourcePosition = _b.sourcePosition, destinationPosition = _b.destinationPosition;
            onDragEnd(sourcePosition, destinationPosition);
            _this.dragState = undefined;
        };
        _this.onPointerMove = function () {
            var level = _this.getDroppedLevel();
            if (!_this.dragState)
                return;
            var _a = _this.dragState, combine = _a.combine, source = _a.source, destination = _a.destination;
            var _b = _this.state, flattenedTree = _b.flattenedTree, horizontalLevel = _b.horizontalLevel;
            // Updates the horizontalLevel state used as parameter on renderDropPlaceholder
            var path;
            if (combine) {
                path = flattenedTree.find(function (item) { return item.item.id === combine.draggableId; }).path;
            }
            else if (destination && level != horizontalLevel) {
                path = flat_tree_1.getDestinationPath(flattenedTree, source.index, destination.index, level);
            }
            if (path && path.length !== horizontalLevel)
                _this.setState({ horizontalLevel: path.length });
            _this.dragState = __assign(__assign({}, _this.dragState), { horizontalLevel: level });
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
                        return flat_tree_1.getDestinationPath(flattenedTree, source.index, destination.index, horizontalLevel);
                    }
                    if (combine) {
                        // Hover on other item while dragging
                        return flat_tree_1.getDestinationPath(flattenedTree, source.index, flat_tree_1.getIndexById(flattenedTree, combine.draggableId), horizontalLevel);
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
            var containerLeft = css_box_model_1.getBox(_this.containerElement).contentBox.left;
            var itemElement = _this.itemsElement[draggedItemId];
            if (itemElement) {
                var currentLeft = css_box_model_1.getBox(itemElement).contentBox.left;
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
            return (react_1.default.createElement(react_beautiful_dnd_next_1.Draggable, { key: flatItem.item.id, draggableId: flatItem.item.id.toString(), index: index, isDragDisabled: isDragDisabled }, _this.renderDraggableItem(flatItem)));
        };
        _this.renderDraggableItem = function (flatItem) { return function (provided, snapshot) {
            var _a = _this.props, renderItem = _a.renderItem, onExpand = _a.onExpand, onCollapse = _a.onCollapse, offsetPerLevel = _a.offsetPerLevel;
            var currentPath = _this.calculateEffectivePath(flatItem, snapshot);
            if (snapshot.isDropAnimating) {
                _this.onDropAnimating();
            }
            return (react_1.default.createElement(TreeItem_1.default, { key: flatItem.item.id, item: flatItem.item, path: currentPath, onExpand: onExpand, onCollapse: onCollapse, renderItem: renderItem, provided: provided, snapshot: snapshot, itemRef: _this.setItemRef, offsetPerLevel: offsetPerLevel }));
        }; };
        return _this;
    }
    Tree.getDerivedStateFromProps = function (props, state) {
        var draggedItemId = state.draggedItemId;
        var tree = props.tree;
        var finalTree = Tree.closeParentIfNeeded(tree, draggedItemId);
        var flattenedTree = tree_1.flattenTree(finalTree);
        return __assign(__assign({}, state), { flattenedTree: flattenedTree });
    };
    Tree.closeParentIfNeeded = function (tree, draggedItemId) {
        if (!!draggedItemId) {
            // Closing parent internally during dragging, because visually we can only move one item not a subtree
            return tree_1.mutateTree(tree, draggedItemId, {
                isExpanded: false,
            });
        }
        return tree;
    };
    Tree.prototype.render = function () {
        var _this = this;
        var _a = this.props, isNestingEnabled = _a.isNestingEnabled, renderDropPlaceholder = _a.renderDropPlaceholder;
        var _b = this.state, dropPlaceholderAttrs = _b.dropPlaceholderAttrs, horizontalLevel = _b.horizontalLevel;
        var renderedItems = this.renderItems();
        return (react_1.default.createElement(react_beautiful_dnd_next_1.DragDropContext, { onDragStart: this.onDragStart, onDragEnd: this.onDragEnd, onDragUpdate: this.onDragUpdate },
            react_1.default.createElement(react_beautiful_dnd_next_1.Droppable, { droppableId: "tree", isCombineEnabled: isNestingEnabled, ignoreContainerClipping: true }, function (provided, snapshot) {
                var finalProvided = _this.patchDroppableProvided(provided);
                return (react_1.default.createElement("div", __assign({ ref: finalProvided.innerRef, style: { pointerEvents: 'auto' }, onTouchMove: _this.onPointerMove, onMouseMove: _this.onPointerMove }, finalProvided.droppableProps),
                    renderedItems,
                    provided.placeholder,
                    renderDropPlaceholder &&
                        dropPlaceholderAttrs &&
                        snapshot.isDraggingOver &&
                        renderDropPlaceholder(dropPlaceholderAttrs, horizontalLevel)));
            })));
    };
    Tree.defaultProps = {
        tree: { children: [] },
        onExpand: handy_1.noop,
        onCollapse: handy_1.noop,
        onDragStart: handy_1.noop,
        onDragEnd: handy_1.noop,
        renderItem: handy_1.noop,
        offsetPerLevel: 35,
        isDragEnabled: false,
        isNestingEnabled: false,
        dropPlaceholder: undefined,
    };
    return Tree;
}(react_1.Component));
exports.default = Tree;
