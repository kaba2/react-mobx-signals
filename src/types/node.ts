import {Signal, noSignals} from 'src/types/signal';
import Matrix from './matrix';

export class NodeSignals {
	readonly transformChanged = new Signal<(node: Node) => void>();
}

export default class Node {
	private _transform: Matrix = new Matrix();
	private _signals = new NodeSignals();

	public constructor(connectSignals = noSignals<NodeSignals>()) {
		connectSignals(this._signals);
	}

	public setTransform(transform: Matrix) {
		this._transform = transform;
		this._signals.transformChanged.emit(this);
	}

	public transform(): Matrix {
		return this._transform;
	}
}
