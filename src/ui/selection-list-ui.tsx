import * as React from 'react';
import Selection from 'src/types/selection';
import {observer} from 'mobx-react';

interface SelectionListProps {
	selection: Selection;
}

@observer
class SelectionListUi extends React.Component<SelectionListProps, {}> {
	public render() {
		let selectionText = '';
		for (const vertex of this.props.selection.vertices()) {
			selectionText += vertex.name() + ' ';
		}
		for (const edge of this.props.selection.edges()) {
			selectionText += edge.name() + ' ';
		}
		if (selectionText === '') {
			selectionText = 'empty';
		}
		return (
			<div className = 'selection-list'>
				<h2>Selection</h2>
				<p>{selectionText}</p>
			</div>
		);
	}
}

export default SelectionListUi;
