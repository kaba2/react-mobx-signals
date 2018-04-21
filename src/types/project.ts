import * as precond from 'precond';
import { MeshVertex, MeshEdge, Mesh } from 'src/types/mesh';
import Selection from 'src/types/selection';
import { renderMesh } from 'src/rendering/rendering';
import * as Canvas from 'src/rendering/canvas';
import Scene from 'src/types/scene';
import Tool from 'src/tools/tool';
import {Signal, dependsOn} from './signal';

export default class Project {
	private _selections = new Set<Selection>();
	private _meshes = new Set<Mesh>();
	private _scenes = new Set<Scene>();
	private _scene?: Scene;
	private _tool?: Tool;

	public readonly meshAdded = new Signal<(mesh: Mesh) => void>();
	public readonly meshToBeRemoved = new Signal<(mesh: Mesh) => void>();
	public readonly meshRemoved = new Signal<() => void>();

	public readonly selectionAdded = new Signal<(selection: Selection) => void>();
	public readonly selectionToBeRemoved = new Signal<(selection: Selection) => void>();
	public readonly selectionRemoved = new Signal<() => void>();

	public readonly sceneAdded = new Signal<(scene: Scene) => void>();
	public readonly sceneToBeRemoved = new Signal<(scene: Scene) => void>();
	public readonly sceneRemoved = new Signal<() => void>();

	public readonly toolWasSet = new Signal<(tool: Tool) => void>();

	public constructor() {
		setInterval(this.render, 1000 / 60);
	}

	public setTool(tool: Tool) {
		this._tool = tool;
		this.toolWasSet.emit(tool);
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
		this.sceneAdded.emit(scene);
		return scene;
	}

	public removeScene(scene: Scene) {
		this.sceneToBeRemoved.emit(scene);
		this._scenes.delete(scene);
		this.sceneRemoved.emit();
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
		this.meshAdded.emit(mesh);
		return mesh;
	}

	public removeMesh(mesh: Mesh) {
		this.meshToBeRemoved.emit(mesh);
		mesh.clear();
		this._meshes.delete(mesh);
		this.meshRemoved.emit();
	}

	public* meshes(): IterableIterator<Mesh> {
		dependsOn(this.meshAdded);
		dependsOn(this.meshRemoved);
		yield* this._meshes;
	}

	public addSelection(): Selection {
		const selection = new Selection();
		precond.checkState(!this._selections.has(selection));
		this._selections.add(selection);
		this.selectionAdded.emit(selection);
		return selection;
	}

	public removeSelection(selection: Selection) {
		this.selectionToBeRemoved.emit(selection);
		this._selections.delete(selection);
		this.selectionRemoved.emit();
	}

	public* selections(): IterableIterator<Selection> {
		dependsOn(this.selectionAdded);
		dependsOn(this.selectionRemoved);
		yield* this._selections;
	}


	private onVertexToBeRemoved = (vertex: MeshVertex) => {
		for (const selection of this._selections) {
			selection.remove(vertex);
		}
	}

	private onEdgeToBeRemoved = (edge: MeshEdge) => {
		for (const selection of this._selections) {
			selection.remove(edge);
		}
	}
}
