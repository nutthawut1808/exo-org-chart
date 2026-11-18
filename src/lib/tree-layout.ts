import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { Employee } from '@/types/employee';

const nodeWidth = 280;
const nodeHeight = 110;

export function getLayoutedElements(
  employees: Employee[],
  expandedIds: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // กรองเฉพาะพนักงานที่ต้องแสดงผล (เช็คจากว่า Manager ถูก Expand อยู่ไหม)
  const visibleEmployees = employees.filter((emp) => {
    if (emp.manager_id === null) return true; // Top Executive แสดงเสมอ
    return expandedIds.has(emp.manager_id);
  });

  visibleEmployees.forEach((emp) => {
    nodes.push({
      id: emp.id,
      type: 'employeeNode',
      data: {
        ...emp,
        hasChildren: employees.some((e) => e.manager_id === emp.id),
        isExpanded: expandedIds.has(emp.id),
      },
      position: { x: 0, y: 0 },
    });

    if (emp.manager_id && visibleEmployees.some((e) => e.id === emp.manager_id)) {
      edges.push({
        id: `e-${emp.manager_id}-${emp.id}`,
        source: emp.manager_id,
        target: emp.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 },
      });
    }
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
}