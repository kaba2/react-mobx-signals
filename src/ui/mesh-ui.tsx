import * as React from 'react';
import {Mesh} from 'src/types/mesh';
import {observer} from 'mobx-react';

interface MeshProps {
  mesh: Mesh;
}

@observer
class MeshUi extends React.Component<MeshProps, {}> {
  public render() {
    const mesh = this.props.mesh;
    let vertexText = '';
    for (const vertex of mesh.vertices()) {
      vertexText += vertex.name() + ' ';
    }
    let edgeText = '';
    for (const edge of mesh.edges()) {
      edgeText += edge.name() + '(' + edge.from().name() + ', ' + edge.to().name() + ') ';
    }
    return (
      <div>
        <h2>Mesh</h2>
        <p>{mesh.numVertices.toString()} vertices: {vertexText}</p>
        <p>{mesh.numEdges.toString()} edges: {edgeText}</p>
      </div>
    );
  }
}

export default MeshUi;
