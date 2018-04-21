import { Mouse } from 'src/types/mouse';
import {Vector2} from 'three';

export function canvas(): HTMLCanvasElement {
	return document.getElementById('canvas') as HTMLCanvasElement;
}

export function canvasCoordinates(mouse: Mouse): Vector2 {
	const rect = canvas().getBoundingClientRect();
	return new Vector2(mouse.clientX - rect.left, mouse.clientY - rect.top);
}
