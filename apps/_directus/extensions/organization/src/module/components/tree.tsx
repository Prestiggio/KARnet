import React from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/base.css';
import Letree from './letree';
import _ from 'lodash';

function __(input: string, replaces: any = {}) {
  let result = input
  /*if(('dict' in window) && (input in dict)) {
    result = dict[input]
  }*/
  for (let repl in replaces) {
    let by = replaces[repl]
    let re = new RegExp(`:${repl}`, "g");
    result = result.replace(re, by)
  }
  return result;
}

// Now you have your nodes and edges

const OrganizationTree = ({ organizationId, tree, positioned, router, api }) => {
  let nodes: Node[] = [];

  const edges: Edge[] = [];

  function addNode(node: any, parentId: string | null, level?: number,) {
    if (!('id' in node)) return; // Skip if no id (some entries are incomplete)

    const type = node.type ?? 'kto';

    nodes.push({
      id: node.id,
      type,
      draggable: node.draggable ?? true,
      data: { ...node, router },
      position: node.position ?? { x: 0, y: 0 } // { x: 200 * level, y: nodes.length * 80 } // Adjust as needed
    });

    return node.id;
  }

  let theParentId: string | null = null

  function processStructure(data: any, parentId: string | null = null, level = 0) {
    if (Array.isArray(data)) {
      data.forEach(item => processStructure(item, theParentId, level));
    } else if (typeof data === 'object' && data !== null) {
      let newParentId = null
      if ('id' in data) {
        newParentId = addNode(data, parentId, level + 1);
      }
      else {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            data[key].forEach(person => processStructure(person, theParentId, level + 1));
          } else if (data[key] && !_.isString(data[key])) {
            newParentId = addNode(data[key], parentId, level + 1);
            theParentId = newParentId
            processStructure(data[key], parentId, level + 2);
          }
        }
      }
    }
  }

  processStructure(tree.nodes);
  
  nodes = nodes.reverse()

  let repositioned: {
    nodes: Node[],
    edges: Array<any>
  } = {
    nodes: [],
    edges: []
  }

  repositioned = {
    ...positioned,
    id: 'nodeinit'
  }

  for (let rnode of repositioned.nodes) {
    let upd = nodes.find(it => it.id === rnode.id)
    if (upd) {
      rnode.data = upd.data
    }
  }

  const isAdmin = true

  if (!isAdmin) {
    for (let rep of repositioned.nodes) {
      rep.draggable = false
    }
  }

  for (let ymlitem of nodes) {
    if (!repositioned.nodes.find((it: any) => it.id === ymlitem.id)) {
      repositioned.nodes.push(ymlitem)
    }
  }

  if(tree.edges) {
    for(const edge of tree.edges) {
      repositioned.edges.push(edge)
    }
  }

  return (
    <Letree key={positioned.id} api={api} organization={{id:organizationId}} Pnodes={nodes} Pedges={edges} positioned={positioned} isAdmin={isAdmin === true} />
  );
};

export default OrganizationTree;