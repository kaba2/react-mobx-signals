import Segment from 'src/geometry/segment';
import {Vector2} from 'three';

export function distanceSegmentPoint(segment: Segment, point: Vector2): number {
	const delta = segment.delta();
	const t = point.clone().sub(segment.from).dot(delta) / delta.dot(delta);
	if (t < 0) {
		return segment.from.distanceTo(point);
	}
	if (t > 1) {
		return segment.to.distanceTo(point);
	}
	return segment.at(t).sub(point).length();
}