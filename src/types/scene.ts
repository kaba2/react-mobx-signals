import Model from './model';
import {Mesh, MeshCell} from 'src/types/mesh';
import {Vector2} from 'three';
import {distanceSegmentPoint} from 'src/geometry/distance-segment-point';
import {Signal, noSignals} from 'src/types/signal';

export class SceneSignals {
	readonly modelAdded = new Signal<(model: Model) => void>();
	readonly modelToBeRemoved = new Signal<(model: Model) => void>();
}

export default class Scene {
	private _models = new Set<Model>();
	private _signals = new SceneSignals();

	public constructor(connectSignals = noSignals<SceneSignals>()) {
		connectSignals(this._signals);
	}

	public addModel(mesh: Mesh): Model {
		const model = new Model(mesh);
		this._models.add(model);
		this._signals.modelAdded.emit(model);
		return model;
	}

	public removeModel(model: Model) {
		this._signals.modelToBeRemoved.emit(model);
		this._models.delete(model);
	}

	public pick(point: Vector2, accept: (cell: MeshCell) => boolean = cell => true): MeshCell|undefined {
		const epsilon = 20;
		for (const model of this._models) {
			const mesh = model.mesh();
			for (const vertex of mesh.vertices()) {
				if (!accept(vertex)) {
					return;
				}
				const vertexPosition = vertex.position();
				const distance = point.distanceTo(vertexPosition);
				if (distance <= epsilon) {
					return vertex;
				}
			}

			for (const edge of mesh.edges()) {
				if (!accept(edge)) {
					return;
				}
				const segment = edge.segment();
				const distance = distanceSegmentPoint(segment, point);
				if (distance <= epsilon) {
					return edge;					
				}
			}
		}
		return undefined;
	}
}
