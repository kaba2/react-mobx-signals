import * as precond from 'precond';
import { Vertex, Edge, Mesh } from 'src/types/mesh';
import Selection from 'src/types/selection';
import { renderMesh } from 'src/rendering/rendering';
import * as Canvas from 'src/rendering/canvas';
import Scene from 'src/types/scene';
import Tool from 'src/tools/tool';
import {Signal, dependsOn, connectable} from 'src/types/signal';

export default class Project {
	private _selections = new Set<Selection>();
	private _meshes = new Set<Mesh>();
	private _scenes = new Set<Scene>();
	private _scene?: Scene;
	private _tool?: Tool;

	private _meshAdded = new Signal<(mesh: Mesh) => void>();
	public readonly meshAdded = connectable(this._meshAdded);

	private _meshToBeRemoved = new Signal<(mesh: Mesh) => void>();
	public readonly meshToBeRemoved = connectable(this._meshToBeRemoved);

	private _meshRemoved = new Signal<() => void>();
	public readonly meshRemoved = connectable(this._meshRemoved);

	private _selectionAdded = new Signal<(selection: Selection) => void>();
	public readonly selectionAdded = connectable(this._selectionAdded);

	private _selectionToBeRemoved = new Signal<(selection: Selection) => void>();
	public readonly selectionToBeRemoved = connectable(this._selectionToBeRemoved);

	private _selectionRemoved = new Signal<() => void>();
	public readonly selectionRemoved = connectable(this._selectionRemoved);

	private _sceneAdded = new Signal<(scene: Scene) => void>();
	public readonly sceneAdded = connectable(this._sceneAdded);

	private _sceneToBeRemoved = new Signal<(scene: Scene) => void>();
	public readonly sceneToBeRemoved = connectable(this._sceneToBeRemoved);

	private _sceneRemoved = new Signal<() => void>();
	public readonly sceneRemoved = connectable(this._sceneRemoved);

	private _toolWasSet = new Signal<(tool: Tool) => void>();
	public readonly toolWasSet = connectable(this._toolWasSet);


	public constructor() {
		setInterval(this.render, 1000 / 60);
	}

	public setTool(tool: Tool) {
		this._tool = tool;
		this._toolWasSet.emit(tool);
	}

	public tool(): Tool|undefined {
		return this._tool;
	}

	public render = () => {
		const canvas = Canvas.canvas();
		if (!canvas) {
			return;
		}

		const context = canvas.getContext('2d')!;
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (const mesh of this._meshes) {
			renderMesh(mesh);
		}
	}

	public addScene(): Scene {
		const scene = new Scene();
		this._scenes.add(scene);
		this._sceneAdded.emit(scene);
		return scene;
	}

	public removeScene(scene: Scene) {
		this._sceneToBeRemoved.emit(scene);
		this._scenes.delete(scene);
		this._sceneRemoved.emit();
	}

	public scene(): Scene|undefined {
		return this._scene;
	}

	public addMesh(): Mesh {
		const mesh = new Mesh();
		precond.checkState(!this._meshes.has(mesh));
		mesh.vertexToBeRemoved.connect(this.onVertexToBeRemoved);
		mesh.edgeToBeRemoved.connect(this.onEdgeToBeRemoved)
		this._meshes.add(mesh);
		this._meshAdded.emit(mesh);
		return mesh;
	}

	public removeMesh(mesh: Mesh) {
		this._meshToBeRemoved.emit(mesh);
		mesh.clear();
		this._meshes.delete(mesh);
		this._meshRemoved.emit();
	}

	public* meshes(): IterableIterator<Mesh> {
		dependsOn(this._meshAdded);
		dependsOn(this._meshRemoved);
		yield* this._meshes;
	}

	public addSelection(): Selection {
		const selection = new Selection();
		precond.checkState(!this._selections.has(selection));
		this._selections.add(selection);
		this._selectionAdded.emit(selection);
		return selection;
	}

	public removeSelection(selection: Selection) {
		this._selectionToBeRemoved.emit(selection);
		this._selections.delete(selection);
		this._selectionRemoved.emit();
	}

	public* selections(): IterableIterator<Selection> {
		dependsOn(this._selectionAdded);
		dependsOn(this._selectionRemoved);
		yield* this._selections;
	}


	private onVertexToBeRemoved = (vertex: Vertex) => {
		for (const selection of this._selections) {
			selection.remove(vertex);
		}
	}

	private onEdgeToBeRemoved = (edge: Edge) => {
		for (const selection of this._selections) {
			selection.remove(edge);
		}
	}
}
