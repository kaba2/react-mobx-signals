import {Signal, connectable} from 'src/types/signal';
import Matrix from './matrix';

export default class Node {
	private _transform: Matrix = new Matrix();
	private _transformChanged = new Signal<(node: Node) => void>();
	public readonly transformChanged = connectable(this._transformChanged);

	public setTransform(transform: Matrix) {
		this._transform = transform;
		this._transformChanged.emit(this);
	}

	public transform(): Matrix {
		return this._transform;
	}
}
