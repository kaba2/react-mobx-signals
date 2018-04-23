import { Mouse } from 'src/types/mouse';

export default interface Tool {
	name(): string;
	
	onMouseMove(mouse: Mouse): void;
	onMouseDown(mouse: Mouse): void;
	onMouseUp(mouse: Mouse): void;
};

