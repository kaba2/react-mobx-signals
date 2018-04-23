import { Mouse } from 'src/types/mouse';
import Tool from 'src/tools/tool';
import {Vector2} from 'three';
import * as Canvas from 'src/rendering/canvas';
import { Mesh, MeshCell, Vertex } from 'src/types/mesh';
import Scene from 'src/types/scene';

export default class DrawTool implements Tool {
	private _from = new Vector2();
	private _to = new Vector2();
	private _mesh: Mesh;
	private _stage: number = 0;
	private _scene: Scene;

	public constructor(scene: Scene, mesh: Mesh) {
		this._scene = scene;
		this._mesh = mesh;
		this._stage = 0;
	}

	public name(): string {
		return 'Draw';
	}

	public onMouseDown = (mouse: Mouse) => {
		if (this._stage !== 0) {
			return
		}
		this._from = Canvas.canvasCoordinates(mouse);
		this._stage += 1;
	};

	public onMouseMove = (mouse: Mouse) => {
		if (this._stage !== 1) {
			return;
		}

		const from = this._from;
		const to = Canvas.canvasCoordinates(mouse);

		const canvas = Canvas.canvas();
		const context = canvas.getContext('2d')!;
		context.fillStyle = 'black';
		context.lineCap = 'round';
		context.lineWidth = 5;
	
		context.beginPath();
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
		context.stroke();
	};

	public onMouseUp = (mouse: Mouse) => {
		if (this._stage !== 1) {
			return;
		}

		this._to = Canvas.canvasCoordinates(mouse);

		let from = this._scene.pick(this._from, 
			(cell: MeshCell) => cell instanceof Vertex) as Vertex|undefined;
		if (!from) {
			from = this._mesh.addVertex();;
			from.setPosition(this._from);
		}

		let to = this._scene.pick(this._to, 
			(cell: MeshCell) => cell instanceof Vertex) as Vertex|undefined;
		if (!to) {
			to = this._mesh.addVertex();;
			to.setPosition(this._to);
		}
	
		this._mesh.addEdge(from, to);
		
		this._stage = 0;
	};
}
