import { NeatConnectionGene } from "./connection-gene";
import { NeatNodeGene } from "./node-gene";

export class NeatInnovationTracker {
  private _nodeInnovation = 0;
  private _connectionInnovation = 0;
  private _nodeInnovations = new Map<string, NeatNodeGene>();
  private _connectionInnovations = new Map<string, NeatConnectionGene>();

  public setNodeInnovationNumber(node: NeatNodeGene) {
    node.innovationNumber = this._nodeInnovation++;
    const key = `${node.innovationNumber}`;
    this._nodeInnovations.set(key, node);
  }

  public setConnectionInnovationNumber(connection: NeatConnectionGene) {
    const { fromNode, toNode } = connection;

    const key = `${fromNode.innovationNumber},${toNode.innovationNumber}`;
    if (this._connectionInnovations.has(key)) {
      connection.innovationNumber =
        this._connectionInnovations.get(key)!.innovationNumber;
    } else {
      connection.innovationNumber = this._connectionInnovation++;
      this._connectionInnovations.set(key, connection);
    }
  }
}
