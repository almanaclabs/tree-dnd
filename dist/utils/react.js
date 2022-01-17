"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameProps = void 0;
exports.sameProps = function (oldProps, newProps, props) {
    return props.find(function (p) { return oldProps[p] !== newProps[p]; }) === undefined;
};
