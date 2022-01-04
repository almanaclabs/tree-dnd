import { Component } from 'react';
import { Props } from './TreeItem-types';
export default class TreeItem extends Component<Props> {
    shouldComponentUpdate(nextProps: Props): boolean;
    patchDraggableProps: (draggableProps: any, snapshot: any) => any;
    render(): import("react").ReactNode;
}
