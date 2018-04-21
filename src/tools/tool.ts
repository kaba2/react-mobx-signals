import { Mouse } from 'src/types/mouse';

export default interface Tool {
	name(): string;
	
	onBegin(): void;
	onCommit(): void;
	onCancel(): void;

	onMouseDragStart(mouse: Mouse): void;
	onMouseDragEnd(mouse: Mouse): void;
	onMouseDrag(mouse: Mouse): void;
	onMouseMove(mouse: Mouse): void;
	onMouseDown(mouse: Mouse): void;
	onMouseUp(mouse: Mouse): void;
	onMouseWheel(mouse: Mouse): void;
};

