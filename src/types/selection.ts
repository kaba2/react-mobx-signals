import { Vertex, Edge, MeshCell } from 'src/types/mesh';
import {Signal, dependsOn, noSignals} from 'src/types/signal';
import {action} from 'mobx';

export class SelectionSignals {
	readonly vertexAdded = new Signal<(vertex: Vertex) => void>();
	readonly vertexToBeRemoved = new Signal<(vertex: Vertex) => void>();
	readonly vertexRemoved = new Signal<() => void>();
	readonly verticesCleared = new Signal<() => void>();

	readonly edgeAdded = new Signal<(edge: Edge) => void>();
	readonly edgeToBeRemoved = new Signal<(edge: Edge) => void>();
	readonly edgeRemoved = new Signal<() => void>();
	readonly edgesCleared = new Signal<() => void>();
}

export default class Selection {
	private _vertices = new Set<Vertex>();
	private _edges = new Set<Edge>();
	private _signals = new SelectionSignals();

	public constructor(connectSignals = noSignals<SelectionSignals>()) {
		connectSignals(this._signals);
	}
	
	public* vertices(): IterableIterator<Vertex> {
		this.dependsOnVertexChanges();
		yield* this._vertices.keys();
	}

	public* edges(): IterableIterator<Edge> {
		this.dependsOnEdgeChanges();
		yield* this._edges.values();
	}

	public add(cell: MeshCell) {
		console.log('<Selection.add>');
		if (cell instanceof Edge) {
			this._edges.add(cell);
			cell.setSelected(true);
			this._signals.edgeAdded.emit(cell);
		} else if (cell instanceof Vertex) {
			this._vertices.add(cell);
			cell.setSelected(true);
			this._signals.vertexAdded.emit(cell);
		}
	}

	public remove(cell: MeshCell) {
		if (cell instanceof Edge) {
			console.log('<Selection.remove(Edge)>');
			this._signals.edgeToBeRemoved.emit(cell);
			this._edges.delete(cell);
			cell.setSelected(false);
			this._signals.edgeRemoved.emit();
		} else if (cell instanceof Vertex) {
			console.log('<Selection.remove(Vertex)>');
			this._signals.vertexToBeRemoved.emit(cell);
			this._vertices.delete(cell);
			cell.setSelected(false);
			this._signals.vertexRemoved.emit();
		}
	}

	public has(cell: MeshCell) {
		if (cell instanceof Edge) {
			this.dependsOnEdgeChanges();
			return this._edges.has(cell);
		} else  if (cell instanceof Vertex) {
			this.dependsOnVertexChanges();
			return this._vertices.has(cell);
		}
		return false;
	}

	public get numVertices() {
		this.dependsOnChanges();
		return this._vertices.size;
	}

	public get numEdges() {
		this.dependsOnChanges();
		return this._edges.size;
	}

	@action
	public clear() {
		for (const vertex of this.vertices()) {
			vertex.setSelected(false);
		}
		for (const edge of this.edges()) {
			edge.setSelected(false);
		}
		this._vertices.clear();
		this._edges.clear();
		this._signals.verticesCleared.emit();
		this._signals.edgesCleared.emit();
	}

	private dependsOnVertexChanges() {
		dependsOn(this._signals.vertexAdded);
		dependsOn(this._signals.vertexRemoved);
		dependsOn(this._signals.verticesCleared);
	}

	private dependsOnEdgeChanges() {
		dependsOn(this._signals.edgeAdded);
		dependsOn(this._signals.edgeRemoved);
		dependsOn(this._signals.edgesCleared);
	}

	private dependsOnChanges() {
		this.dependsOnEdgeChanges();
		this.dependsOnVertexChanges();
	}
}
