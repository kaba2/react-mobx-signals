import * as React from 'react';
import ToolbarUi from 'src/ui/toolbar-ui';
import ViewportUi from './viewport-ui';
import SelectionListUi from 'src/ui/selection-list-ui';
import MeshUi from 'src/ui/mesh-ui';
import DrawTool from 'src/tools/draw-tool';
import './App.css';
import Project from 'src/types/project';
import SelectTool from 'src/tools/select-tool';
import Tool from 'src/tools/tool';
import Selection from 'src/types/selection';
import {observer} from 'mobx-react';

const project = new Project();
const scene = project.addScene();

const mesh = project.addMesh();
scene.addModel(mesh);

const selection = project.addSelection();

const tools = [new DrawTool(scene, mesh), new SelectTool(scene, selection)];

interface AppProps {
}

interface AppState {
  tool: Tool;
  selection: Selection;
}

@observer
class AppUi extends React.Component<AppProps, AppState> {
	public constructor(props: AppProps) {
    super(props);
		this.state = {
      tool: tools[0],
      selection
		};
	}

	private setTool(tool: Tool) {
		this.setState({
			tool,
    });
  }
  
  public setSelection(selection: Selection) {
    this.setState({
      selection
    });
  }

	public onKeyPress(keyboard: React.KeyboardEvent<{}>) {
		console.log('event!', keyboard.key);
		if (keyboard.key == 'd') {
      for (const edge of Array.from(selection.edges())) {
        mesh.removeEdge(edge);
      }
      for (const vertex of Array.from(selection.vertices())) {
        mesh.removeVertex(vertex);
			}
		}
	}

	public render() {
		return (
			<div className="App" onKeyPress={event => this.onKeyPress(event)}>
				<h1>AnyPaint</h1>
				<p>Draw tool: left-click + drag to draw edges. Start from or end to a vertex to share it.</p>
				<p>Selection tool: hover to highlight, left-click to reset selection and select, ctrl + left-click to toggle selection .</p>
				<p>Small key d: remove selected cells.</p>
				<ViewportUi tool={this.state.tool} />
				<ToolbarUi
					tools={tools}
					onSelectTool={tool => this.setTool(tool)}
				/>
				<h2>Tool</h2>
				<p>{this.state.tool.name()}</p>
        <SelectionListUi selection={selection}/>
				<MeshUi mesh={mesh}/>
			</div>
		);
	}
}

export default AppUi;
