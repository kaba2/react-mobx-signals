import * as React from 'react';
import Tool from 'src/tools/tool'
import {observer} from 'mobx-react';

interface ViewportProps {
  tool: Tool;
}

@observer
class ViewportUi extends React.Component<ViewportProps, {}> {
  public render() {
    return (
      <canvas 
        id="canvas" 
        width="600" 
        height="300" 
        onMouseDown={this.props.tool.onMouseDown} 
        onMouseMove={this.props.tool.onMouseMove}
        onMouseUp={this.props.tool.onMouseUp}
      > Canvas not supported
    	</canvas>
    );
  }
}

export default ViewportUi;
