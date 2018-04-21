import Node from './node';
import {Mesh} from 'src/types/mesh';

export default class Model extends Node {
	private _mesh: Mesh;

	public constructor(mesh: Mesh) {
		super();
		this._mesh = mesh;
	}

	public mesh(): Mesh {
		return this._mesh;
	}
}
