import { Mouse } from 'src/types/mouse';
import Tool from 'src/tools/tool';
import * as Canvas from 'src/rendering/canvas';
import Scene from 'src/types/scene';
import { MeshCell } from 'src/types/mesh';
import Selection from 'src/types/selection';

export default class SelectTool implements Tool {
	private _scene: Scene;
	private _selection: Selection;
	private _cell?: MeshCell;

	public constructor(scene: Scene, selection: Selection) {
		this._scene = scene;
		this._selection = selection;
		this._cell = undefined;
	}

	public name(): string {
		return 'Select';
	}

	public onMouseUp = (mouse: Mouse) => {
		if (!mouse.ctrlKey) {
			this._selection.clear();
		}

		this.pick(mouse);

		if (!this._cell) {
			return;
		}

		if (this._selection.has(this._cell)) {
			this._selection.remove(this._cell);
		} else {
			this._selection.add(this._cell);
		}
	};

	public onMouseMove = (mouse: Mouse) => {
		this.pick(mouse);
	};

	public pick = (mouse: Mouse) => {
		if (this._cell) {
			this._cell.setHighlighted(false);
		}

		const to = Canvas.canvasCoordinates(mouse);
		const cell = this._scene.pick(to);
		if (cell) {
			cell.setHighlighted(true);
		}
		this._cell = cell;
	};

	public onMouseDown = (mouse: Mouse) => {};
}
