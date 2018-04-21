import {Signal} from './signal';
import Matrix from './matrix';

export default class Node {
	private _transform: Matrix = new Matrix();
	public transformChanged = new Signal<(node: Node) => void>();

	public setTransform(transform: Matrix) {
		this._transform = transform;
		this.transformChanged.emit(this);
	}

	public transform(): Matrix {
		return this._transform;
	}
}
