import { Vertex, Edge, MeshCell } from 'src/types/mesh';
import {Signal, dependsOn, connectable} from 'src/types/signal';
import {action} from 'mobx';

export default class Selection {
	private _vertices = new Set<Vertex>();

	private _vertexAdded = new Signal<(vertex: Vertex) => void>();
	public readonly vertexAdded = connectable(this._vertexAdded);
	
	private _vertexToBeRemoved = new Signal<(vertex: Vertex) => void>();
	public readonly vertexToBeRemoved = connectable(this._vertexToBeRemoved);
	
	private _vertexRemoved = new Signal<() => void>();
	public readonly vertexRemoved = connectable(this._vertexRemoved);
	
	private _verticesCleared = new Signal<() => void>();
	public readonly verticesCleared = connectable(this._verticesCleared);
	
	private _edges = new Set<Edge>();
	
	private _edgeAdded = new Signal<(edge: Edge) => void>();
	public readonly edgeAdded = connectable(this._edgeAdded);
	
	private _edgeToBeRemoved = new Signal<(edge: Edge) => void>();
	public readonly edgeToBeRemoved = connectable(this._edgeToBeRemoved);
	
	private _edgeRemoved = new Signal<() => void>();
	public readonly edgeRemoved = connectable(this._edgeRemoved);
	
	private _edgesCleared = new Signal<() => void>();
	public readonly edgesCleared = connectable(this._edgesCleared);

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
			this._edgeAdded.emit(cell);
		} else if (cell instanceof Vertex) {
			this._vertices.add(cell);
			cell.setSelected(true);
			this._vertexAdded.emit(cell);
		}
	}

	public remove(cell: MeshCell) {
		if (cell instanceof Edge) {
			console.log('<Selection.remove(Edge)>');
			this._edgeToBeRemoved.emit(cell);
			this._edges.delete(cell);
			cell.setSelected(false);
			this._edgeRemoved.emit();
		} else if (cell instanceof Vertex) {
			console.log('<Selection.remove(Vertex)>');
			this._vertexToBeRemoved.emit(cell);
			this._vertices.delete(cell);
			cell.setSelected(false);
			this._vertexRemoved.emit();
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
		this._verticesCleared.emit();
		this._edgesCleared.emit();
	}

	private dependsOnVertexChanges() {
		dependsOn(this._vertexAdded);
		dependsOn(this._vertexRemoved);
		dependsOn(this._verticesCleared);
	}

	private dependsOnEdgeChanges() {
		dependsOn(this._edgeAdded);
		dependsOn(this._edgeRemoved);
		dependsOn(this._edgesCleared);
	}

	private dependsOnChanges() {
		this.dependsOnEdgeChanges();
		this.dependsOnVertexChanges();
	}
}
