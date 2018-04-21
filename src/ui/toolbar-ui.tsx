import * as React from 'react';
import ToolUi from 'src/ui/tool-ui';
import Tool from 'src/tools/tool';
import {observer} from 'mobx-react';

interface ToolbarProps {
  tools: Tool[];
  onSelectTool: (Tool: Tool) => void;
}

@observer
class ToolbarUi extends React.Component<ToolbarProps, {}> {
  public renderTool(i: number) {
    const tool = this.props.tools[i];
    return <ToolUi key={i.toString()} toolName={tool.name()} onClick={() => this.props.onSelectTool(tool)} />;
  }

  public render() {
    const tools = [];
    for (let i = 0;i < this.props.tools.length; ++i) {
      tools.push(this.renderTool(i));
    }
    return (
      <div>
        {tools}
      </div>
    );
  }
}

export default ToolbarUi;
