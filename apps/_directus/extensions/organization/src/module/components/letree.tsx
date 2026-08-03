import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, addEdge, MiniMap, NodeChange, Controls, Node, Edge, OnConnect, MarkerType, useReactFlow, Panel } from 'reactflow';
import 'reactflow/dist/base.css';
import CustomNode from './custom-node';
import CaeNode from './cae-node';
import Kto from './kto-node';
import Logo from './logo';
import Background from './background';
import DownloadButton from './download-button';
import { Button } from './button';
import { ReactFlowInstance } from 'reactflow';

const flowKey = 'example-flow';

const nodeTypes = {
  background: Background,
  custom: CustomNode,
  cae: CaeNode,
  kto: Kto,
  logo: Logo
};

const initNodes: Node[] = [
  {
    id: '5',
    type: 'custom',
    data: { name: 'Msnr RAOELISON Jean de Dieu', function: `Arsevekan'Antananarivo`, avatar: null },
    position: { x: 0, y: 0 },
  },
  {
    id: '1',
    type: 'custom',
    data: { name: 'RP Allain Michel', function: 'Curé', avatar: null },
    position: { x: 0, y: 100 },
  },
  {
    id: '2',
    type: 'custom',
    data: { name: 'RP RALISON Jean Désiré', function: 'Vicaire', avatar: null },
    position: { x: -300, y: 200 },
  },
  {
    id: '3',
    type: 'custom',
    data: { name: 'RP Richard', function: 'Vicaire', avatar: null },
    position: { x: 0, y: 200 },
  },
  {
    id: '6',
    type: 'cae',
    className: 'bg-green-300 relative flex',
    data: { name : 'CAE'},
    style: { width: 300, height: 300 },
    position: { x: 300, y : 200 }
  },
  {
    id: '7',
    type: 'custom',
    className: 'bg-slate-200',
    data: { name : 'RAKOTOVAO Jean Luc', avatar: null },
    position: { x: 5, y : 5 },
    parentId: '6'
  },
];

const initEdges: Edge[] = [
  {
    type: 'step',
    id: 'e5-1',
    source: '5',
    target: '1',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    type: 'step',
    id: 'e1-2',
    source: '1',
    target: '2',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'step',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

const OrganizationTree = (props: {Pnodes: Node[], Pedges: Edge[], isAdmin:boolean, positioned:any}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(props.positioned.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(props.positioned.edges);
  const [rfInstance, setRfInstance] = useState<null|ReactFlowInstance>(null);
  const { setViewport } = useReactFlow();
  const onNodesChangeCustom = (changes: NodeChange[])=>{
    return onNodesChange(changes)
  }

  const initiated = (ref:any) => {
    setRfInstance(ref)
    setViewport(props.positioned.viewport)
  }

  const onConnect: OnConnect = useCallback((params) => setEdges((eds) => addEdge({...params, type: 'step', zIndex: 900, markerEnd: { type: MarkerType.ArrowClosed }}, eds)), []);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onSaveToFile = useCallback(async() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const response = await fetch('/mg/Arsidiosezy-Antananarivo/Vikaria-Episkopaly-Afovoany/Ditrika-Mahamasina/EKAR-Ambatonilita/filan-kevitra/save', {
        method: 'POST',
        body: JSON.stringify(flow)
      })
      const rsp = await response.json()
    }
  }, [rfInstance]);

  /*
  useEffect(() => {
    setInterval(onSaveToFile, 30000)
  }, [onSaveToFile])
  */

  const onRestoreFromCookie = useCallback(() => {
    const flow = JSON.parse(localStorage.getItem(flowKey) as string);

    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      setViewport({ x, y, zoom });
    }

  }, [setNodes, setViewport]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = props.positioned;

      if (flow) {
        for(const ind of flow.nodes) {
          const fno:{data:any}|undefined = props.Pnodes.find(it=>it.id===ind.id)
          ind.data = fno?.data || {}
        }
        //get new nodes in the yaml
        for(const ynd of props.Pnodes) {
          const found = flow.nodes.find((it:any)=>it.id === ynd.id)
          if(!found) {
            flow.nodes.push(ynd)
          }
        }
        //delete nodes not in the yaml
        for(let nnd = 0; nnd<flow.nodes.length; nnd++) {
          const innd = flow.nodes[nnd]
          const found = props.Pnodes.find((it:any)=>it.id === innd.id)
          if(!found) {
            flow.nodes.splice(nnd, 1)
          }
        }
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  return (
    
        <div className='w-full h-screen bg-white'>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeCustom}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={initiated}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.01}
            >
              <MiniMap />
              <Controls />
              <Panel position="top-right">
                {props.isAdmin && <>
                  <Button onClick={onSave}>save to cookie</Button>
                  <Button onClick={onSaveToFile}>save to file</Button>
                  <Button onClick={onRestoreFromCookie}>restore from cookie</Button>
                  <Button onClick={onRestore}>restore from file</Button>
                </>}
                <DownloadButton />
              </Panel>
              
            </ReactFlow>
        </div>

  );
};

export default (props:any)=><ReactFlowProvider>
  <OrganizationTree {...props}/>
</ReactFlowProvider>;