import * as precond from 'precond';
import { Vertex, Edge, Mesh, MeshSignals } from 'src/types/mesh';
import Selection from 'src/types/selection';
import { renderMesh } from 'src/rendering/rendering';
import * as Canvas from 'src/rendering/canvas';
import Scene from 'src/types/scene';
import Tool from 'src/tools/tool';
import {Signal, dependsOn, noSignals } from 'src/types/signal';

export class ProjectSignals {
	readonly meshAdded = new Signal<(mesh: Mesh) => void>();
	readonly meshToBeRemoved = new Signal<(mesh: Mesh) => void>();
	readonly selectionAdded = new Signal<(selection: Selection) => void>();
	readonly selectionToBeRemoved = new Signal<(selection: Selection) => void>();
	readonly sceneAdded = new Signal<(scene: Scene) => void>();
	readonly sceneToBeRemoved = new Signal<(scene: Scene) => void>();
	readonly toolWasSet = new Signal<(tool: Tool) => void>();
}

export default class Project {
	private _selections = new Set<Selection>();
	private _meshes = new Set<Mesh>();
	private _scenes = new Set<Scene>();
	private _scene?: Scene;
	private _tool?: Tool;
	private _signals = new ProjectSignals();

	private _meshRemoved = new Signal<() => void>();
	private _sceneRemoved = new Signal<() => void>();
	private _selectionRemoved = new Signal<() => void>();

	public constructor(connectSignals = noSignals<ProjectSignals>()) {
		connectSignals(this._signals);
		setInterval(this.render, 1000 / 60);
	}

	public setTool(tool: Tool) {
		this._tool = tool;
		this._signals.toolWasSet.emit(tool);
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
		this._signals.sceneAdded.emit(scene);
		return scene;
	}

	public removeScene(scene: Scene) {
		this._signals.sceneToBeRemoved.emit(scene);
		this._scenes.delete(scene);
		this._sceneRemoved.emit();
	}

	public scene(): Scene|undefined {
		return this._scene;
	}

	public addMesh(): Mesh {
		const mesh = new Mesh((signals: MeshSignals) => {
			signals.vertexToBeRemoved.connect(this.onVertexToBeRemoved);
			signals.edgeToBeRemoved.connect(this.onEdgeToBeRemoved)
		});
		precond.checkState(!this._meshes.has(mesh));
		this._meshes.add(mesh);
		this._signals.meshAdded.emit(mesh);
		return mesh;
	}

	public removeMesh(mesh: Mesh) {
		this._signals.meshToBeRemoved.emit(mesh);
		mesh.clear();
		this._meshes.delete(mesh);
		this._meshRemoved.emit();
	}

	public* meshes(): IterableIterator<Mesh> {
		dependsOn(this._signals.meshAdded);
		dependsOn(this._meshRemoved);
		yield* this._meshes;
	}

	public addSelection(): Selection {
		const selection = new Selection();
		precond.checkState(!this._selections.has(selection));
		this._selections.add(selection);
		this._signals.selectionAdded.emit(selection);
		return selection;
	}

	public removeSelection(selection: Selection) {
		this._signals.selectionToBeRemoved.emit(selection);
		this._selections.delete(selection);
		this._selectionRemoved.emit();
	}

	public* selections(): IterableIterator<Selection> {
		dependsOn(this._signals.selectionAdded);
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
