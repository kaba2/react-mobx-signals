import * as Canvas from 'src/rendering/canvas';
import { Mesh } from 'src/types/mesh';

export function renderMesh(mesh: Mesh) {
	const canvas = Canvas.canvas();
	if (!canvas) {
		return;
	}

	const context = canvas.getContext('2d')!;
	context.fillStyle = 'black';
	context.lineCap = 'round';

	for (const edge of mesh.edges()) {
		let style = 'black';
		if (edge.selected()) {
			style = 'red';
		} else if (edge.highlighted()) {
			style = 'orange';
		}
		context.strokeStyle = style;
		context.lineWidth = 5;

		const from = edge.from().position();
		const to = edge.to().position();

		context.beginPath();
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
		context.stroke();
		
		const center = edge.segment().at(0.5);
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.fillStyle = 'red';
		context.font = '30px Arial';
		context.textAlign = 'center';
		context.fillText(edge.name(), center.x, center.y);
		context.strokeText(edge.name(), center.x, center.y);
	}

	for (const vertex of mesh.vertices()) {
		let style = 'black';
		if (vertex.selected()) {
			style = 'red';
		} else if (vertex.highlighted()) {
			style = 'orange';
		}
		context.strokeStyle = style;
		context.lineWidth = 1;

		const p= vertex.position();
		context.beginPath();
		context.moveTo(p.x, p.y);
		context.ellipse(p.x, p.y, 10, 10, 0, 0, 2 * Math.PI);
		context.stroke();

		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.fillStyle = 'red';
		context.font = '30px Arial';
		context.textAlign = 'center';
		context.fillText(vertex.name(), p.x, p.y);
		context.strokeText(vertex.name(), p.x, p.y);
	}
};
