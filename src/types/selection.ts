import { Vertex, Edge, MeshCell } from 'src/types/mesh';
import {Signal, dependsOn} from 'src/typed-signals/src/Signal';
import {action} from 'mobx';

export default class Selection {
	private _vertices = new Set<Vertex>();
	public readonly vertexAdded = new Signal<(vertex: Vertex) => void>();
	public readonly vertexToBeRemoved = new Signal<(vertex: Vertex) => void>();
	public readonly vertexRemoved = new Signal<() => void>();
	public readonly verticesCleared = new Signal<() => void>();
	
	private _edges = new Set<Edge>();
	public readonly edgeAdded = new Signal<(edge: Edge) => void>();
	public readonly edgeToBeRemoved = new Signal<(edge: Edge) => void>();
	public readonly edgeRemoved = new Signal<() => void>();
	public readonly edgesCleared = new Signal<() => void>();

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
			this.edgeAdded.emit(cell);
		} else if (cell instanceof Vertex) {
			this._vertices.add(cell);
			cell.setSelected(true);
			this.vertexAdded.emit(cell);
		}
	}

	public remove(cell: MeshCell) {
		if (cell instanceof Edge) {
			console.log('<Selection.remove(Edge)>');
			this.edgeToBeRemoved.emit(cell);
			this._edges.delete(cell);
			cell.setSelected(false);
			this.edgeRemoved.emit();
		} else if (cell instanceof Vertex) {
			console.log('<Selection.remove(Vertex)>');
			this.vertexToBeRemoved.emit(cell);
			this._vertices.delete(cell);
			cell.setSelected(false);
			this.vertexRemoved.emit();
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
		this.verticesCleared.emit();
		this.edgesCleared.emit();
	}

	private dependsOnVertexChanges() {
		dependsOn(this.vertexAdded);
		dependsOn(this.vertexRemoved);
		dependsOn(this.verticesCleared);
	}

	private dependsOnEdgeChanges() {
		dependsOn(this.edgeAdded);
		dependsOn(this.edgeRemoved);
		dependsOn(this.edgesCleared);
	}

	private dependsOnChanges() {
		this.dependsOnEdgeChanges();
		this.dependsOnVertexChanges();
	}
}
