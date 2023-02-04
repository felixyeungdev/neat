import type { NeatConnectionGene } from "./connection-gene.js";
import type { NeatNodeGene } from "./node-gene.js";

export class NeatInnovationTracker {
  private _nodeInnovation = 0;
  private _connectionInnovation = 0;
  private _nodeInnovations = new Map<string, NeatNodeGene>();
  private _connectionInnovations = new Map<string, NeatConnectionGene>();

  public registerNode(node: NeatNodeGene) {
    const key = `${node.innovationNumber}`;

    if (this._nodeInnovations.has(key)) return;

    this._nodeInnovations.set(key, node);
    this._nodeInnovation = Math.max(
      this._nodeInnovation,
      node.innovationNumber
    );
  }

  public registerConnection(connection: NeatConnectionGene) {
    const { fromNode, toNode } = connection;
    const key = `${fromNode.innovationNumber},${toNode.innovationNumber}`;

    if (this._connectionInnovations.has(key)) return;

    this._connectionInnovations.set(key, connection);
    this._connectionInnovation = Math.max(
      this._connectionInnovation,
      connection.innovationNumber
    );
  }

  public setNodeInnovationNumber(node: NeatNodeGene) {
    node.innovationNumber = ++this._nodeInnovation;
    const key = `${node.innovationNumber}`;
    this._nodeInnovations.set(key, node);
  }

  public setConnectionInnovationNumber(connection: NeatConnectionGene) {
    const { fromNode, toNode } = connection;

    const key = `${fromNode.innovationNumber},${toNode.innovationNumber}`;
    if (this._connectionInnovations.has(key)) {
      const cached = this._connectionInnovations.get(key);
      if (!cached) return;
      connection.innovationNumber = cached.innovationNumber;
    } else {
      connection.innovationNumber = ++this._connectionInnovation;
      this._connectionInnovations.set(key, connection);
    }
  }
}
