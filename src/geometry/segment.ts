import {Vector2} from 'three';

export default class Segment {
	public from: Vector2;
	public to: Vector2;

	public constructor(from: Vector2, to: Vector2) {
		this.from = from.clone();
		this.to = to.clone();
	}

	public delta(): Vector2 {
		return this.to.clone().sub(this.from);
	}

	public at(t: number): Vector2 {
		return this.from.clone().add(this.delta().multiplyScalar(t));
	}
}
