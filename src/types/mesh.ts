import {Vector2} from 'three';
import { Signal, dependsOn } from 'src/typed-signals/src/Signal';
import Segment from 'src/geometry/segment';

let globalEdgeId = 0;
let globalVertexId = 0;

export class MeshCell {
	private _selected: boolean;
	private _highlighted: boolean;

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

export class MeshVertex extends MeshCell {
	private _position = new Vector2();
	private _edges = new Set<MeshEdge>();
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

	public* edges(): IterableIterator<MeshEdge> {
		const self = this;
		yield* self._edges;
	}

	public _addEdge(edge: MeshEdge) {
		this._edges.add(edge);
	}
}

export class MeshEdge extends MeshCell {
	private _from: MeshVertex;
	private _to: MeshVertex;
	private _id: number;

	public constructor(from: MeshVertex, to: MeshVertex) {
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

	public from(): MeshVertex {
		return this._from;
	}

	public to(): MeshVertex {
		return this._to;
	}
}

export class Mesh {
	private _vertices = new Set<MeshVertex>();
	private _edges = new Set<MeshEdge>();
	
	public readonly vertexToBeAdded = new Signal<() => void>();
	public readonly vertexAdded = new Signal<(vertex: MeshVertex) => void>();
	public readonly vertexToBeRemoved = new Signal<(vertex: MeshVertex) => void>();
	public readonly vertexRemoved = new Signal<() => void>();

	public readonly edgeToBeAdded = new Signal<() => void>();
	public readonly edgeAdded = new Signal<(edge: MeshEdge) => void>();
	public readonly edgeToBeRemoved = new Signal<(edge: MeshEdge) => void>();
	public readonly edgeRemoved = new Signal<() => void>();
	
	public readonly toBeCleared = new Signal<(mesh: Mesh) => void>();
	public readonly cleared = new Signal<(mesh: Mesh) => void>();

	public clear() {
		this.toBeCleared.emit(this);

		this._vertices.clear();
		this._edges.clear();

		this.cleared.emit(this);
	}

	public disconnectAll() {
		this.vertexToBeAdded.disconnectAll();
		this.vertexAdded.disconnectAll();
		this.vertexToBeRemoved.disconnectAll();
		this.vertexRemoved.disconnectAll();

		this.edgeToBeAdded.disconnectAll();
		this.edgeAdded.disconnectAll();
		this.edgeToBeRemoved.disconnectAll();
		this.edgeRemoved.disconnectAll();
	}

	public get numVertices(): number {
		this.dependsOnVertexChanges();
		return this._vertices.size;
	}

	public get numEdges(): number {
		this.dependsOnEdgeChanges();
		return this._edges.size;
	}

	public addVertex(): MeshVertex {
		console.log('<Mesh.addVertex>');
		this.vertexToBeAdded.emit();

		const vertex = new MeshVertex();
		this._vertices.add(vertex);
		
		this.vertexAdded.emit(vertex);
		console.log('<Mesh.addVertex/>');
		return vertex;
	}

	public removeVertex(vertex: MeshVertex) {
		console.log('<Mesh.removeVertex>');
		
		const edges = Array.from(vertex.edges());
		for (const edge of edges) {
			this.removeEdge(edge);
		}

		this.vertexToBeRemoved.emit(vertex);

		this._vertices.delete(vertex);
		
		this.vertexRemoved.emit();
		console.log('<Mesh.removeVertex/>');
	}

	public* vertices(): IterableIterator<MeshVertex> {
		this.dependsOnVertexChanges();
		const self = this;
		yield* self._vertices;
	}

	public addEdge(from: MeshVertex, to: MeshVertex): MeshEdge {
		console.log('<Mesh.addEdge>');
		this.edgeToBeAdded.emit();

		const edge = new MeshEdge(from, to);
		from._addEdge(edge);
		to._addEdge(edge);
		this._edges.add(edge);

		this.edgeAdded.emit(edge);
		console.log('<Mesh.addEdge/>');
		return edge;
	}

	public removeEdge (edge: MeshEdge) {
		console.log('<Mesh.removeEdge>');

		this.edgeToBeRemoved.emit(edge);
		
		this._edges.delete(edge);
		
		this.edgeRemoved.emit();
		console.log('<Mesh.removeEdge/>');
	}

	public* edges(): IterableIterator<MeshEdge> {
		this.dependsOnEdgeChanges();
		const self = this;
		yield* self._edges;
	}

	private dependsOnVertexChanges() {
		dependsOn(this.vertexAdded);
		dependsOn(this.vertexRemoved);
		dependsOn(this.cleared);
	}

	private dependsOnEdgeChanges() {
		dependsOn(this.edgeAdded);
		dependsOn(this.edgeRemoved);
		dependsOn(this.cleared);
	}
}
