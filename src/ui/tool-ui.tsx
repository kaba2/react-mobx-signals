import * as React from 'react';
import {observer} from 'mobx-react';

interface ToolProps {
  toolName: string;
  onClick: () => void;
}

@observer
class ToolUi extends React.Component<ToolProps, {}> {
  public render() {
    return (
      <button className='tool' onClick={this.props.onClick}>
        {this.props.toolName}
      </button>
    );
  }
}

export default ToolUi;
