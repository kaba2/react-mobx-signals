import {Vector2} from 'three';
import { Signal, connectable, dependsOn } from 'src/types/signal';
import Segment from 'src/geometry/segment';

let globalEdgeId = 0;
let globalVertexId = 0;

export class MeshCell {
	private _selected: boolean = false;
	private _highlighted: boolean = false;

	public setSelected(selected: boolean) {
		this._selected = selected;
	}

	public selected(): boolean {
		return this._selected;
	}

	public setHighlighted(highlighted: boolean) {
		this._highlighted = highlighted;
	}

	public highlighted(): boolean {
		return this._highlighted;
	}

}

export class Vertex extends MeshCell {
	private _position = new Vector2();
	private _edges = new Set<Edge>();
	private _id: number

	public constructor() {
		super();
		this._id = globalVertexId;
		globalVertexId += 1;
	}

	public id(): number {
		return this._id;
	}

	public name(): string {
		return 'v' + this._id.toString();
	}

	public setPosition(position: Vector2) {
		this._position = position;
	}

	public position(): Vector2 {
		return this._position;
	}

	public* edges(): IterableIterator<Edge> {
		const self = this;
		yield* self._edges;
	}

	public _addEdge(edge: Edge) {
		this._edges.add(edge);
	}
}

export class Edge extends MeshCell {
	private _from: Vertex;
	private _to: Vertex;
	private _id: number;

	public constructor(from: Vertex, to: Vertex) {
		super();
		this._from = from;
		this._to = to;
		this._id = globalEdgeId;
		globalEdgeId += 1;
	}

	public id(): number {
		return this._id;
	}

	public name(): string {
		return 'e' + this._id.toString();
	}

	public segment(): Segment {
		return new Segment(this._from.position(), this._to.position());
	}

	public from(): Vertex {
		return this._from;
	}

	public to(): Vertex {
		return this._to;
	}
}

export class Mesh {
	private _vertices = new Set<Vertex>();
	private _edges = new Set<Edge>();

	private _vertexToBeAdded = new Signal<() => void>();
	public readonly vertexToBeAdded = connectable(this._vertexToBeAdded);

	private _vertexAdded = new Signal<(vertex: Vertex) => void>();
	public readonly vertexAdded = connectable(this._vertexAdded);

	private _vertexToBeRemoved = new Signal<(vertex: Vertex) => void>();
	public readonly vertexToBeRemoved = connectable(this._vertexToBeRemoved);

	private _vertexRemoved = new Signal<() => void>();
	public readonly vertexRemoved = connectable(this._vertexRemoved);

	private _edgeToBeAdded = new Signal<() => void>();
	public readonly edgeToBeAdded = connectable(this._edgeToBeAdded);

	private _edgeAdded = new Signal<(edge: Edge) => void>();
	public readonly edgeAdded = connectable(this._edgeAdded);

	private _edgeToBeRemoved = new Signal<(edge: Edge) => void>();
	public readonly edgeToBeRemoved = connectable(this._edgeToBeRemoved);

	private _edgeRemoved = new Signal<() => void>();
	public readonly edgeRemoved = connectable(this._edgeRemoved);

	private _toBeCleared = new Signal<(mesh: Mesh) => void>();
	public readonly toBeCleared = connectable(this._toBeCleared);

	private _cleared = new Signal<(mesh: Mesh) => void>();
	public readonly cleared = connectable(this._cleared);
	
	public clear() {
		this._toBeCleared.emit(this);

		this._vertices.clear();
		this._edges.clear();

		this._cleared.emit(this);
	}

	public disconnectAll() {
		this._vertexToBeAdded.disconnectAll();
		this._vertexAdded.disconnectAll();
		this._vertexToBeRemoved.disconnectAll();
		this._vertexRemoved.disconnectAll();

		this._edgeToBeAdded.disconnectAll();
		this._edgeAdded.disconnectAll();
		this._edgeToBeRemoved.disconnectAll();
		this._edgeRemoved.disconnectAll();
	}

	public get numVertices(): number {
		this.dependsOnVertexChanges();
		return this._vertices.size;
	}

	public get numEdges(): number {
		this.dependsOnEdgeChanges();
		return this._edges.size;
	}

	public addVertex(): Vertex {
		console.log('<Mesh.addVertex>');
		this._vertexToBeAdded.emit();

		const vertex = new Vertex();
		this._vertices.add(vertex);
		
		this._vertexAdded.emit(vertex);
		console.log('<Mesh.addVertex/>');
		return vertex;
	}

	public removeVertex(vertex: Vertex) {
		console.log('<Mesh.removeVertex>');
		
		const edges = Array.from(vertex.edges());
		for (const edge of edges) {
			this.removeEdge(edge);
		}

		this._vertexToBeRemoved.emit(vertex);

		this._vertices.delete(vertex);
		
		this._vertexRemoved.emit();
		console.log('<Mesh.removeVertex/>');
	}

	public* vertices(): IterableIterator<Vertex> {
		this.dependsOnVertexChanges();
		const self = this;
		yield* self._vertices;
	}

	public addEdge(from: Vertex, to: Vertex): Edge {
		console.log('<Mesh.addEdge>');
		this._edgeToBeAdded.emit();

		const edge = new Edge(from, to);
		from._addEdge(edge);
		to._addEdge(edge);
		this._edges.add(edge);

		this._edgeAdded.emit(edge);
		console.log('<Mesh.addEdge/>');
		return edge;
	}

	public removeEdge (edge: Edge) {
		console.log('<Mesh.removeEdge>');

		this._edgeToBeRemoved.emit(edge);
		
		this._edges.delete(edge);
		
		this._edgeRemoved.emit();
		console.log('<Mesh.removeEdge/>');
	}

	public* edges(): IterableIterator<Edge> {
		this.dependsOnEdgeChanges();
		const self = this;
		yield* self._edges;
	}

	private dependsOnVertexChanges() {
		dependsOn(this._vertexAdded);
		dependsOn(this._vertexRemoved);
		dependsOn(this._cleared);
	}

	private dependsOnEdgeChanges() {
		dependsOn(this._edgeAdded);
		dependsOn(this._edgeRemoved);
		dependsOn(this._cleared);
	}
}
