import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, addEdge, MiniMap, NodeChange, EdgeChange, Controls, Node, Edge, OnConnect, MarkerType, useReactFlow, Panel } from 'reactflow';
import 'reactflow/dist/base.css';
import CustomNode from './custom-node';
import CaeNode from './cae-node';
import Kto from './kto-node';
import Logo from './logo';
import Background from './background';
import DownloadButton from './download-button';
import { Button } from './button';
import { ReactFlowInstance } from 'reactflow';
import OrganigramContext from './context';

const flowKey = 'example-flow';

const nodeTypes = {
  background: Background,
  custom: CustomNode,
  cae: CaeNode,
  kto: Kto,
  logo: Logo
};

const OrganizationTree = (props: { organization: any, Pnodes: Node[], Pedges: Edge[], isAdmin: boolean, positioned: any, api: any }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(props.positioned.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(props.positioned.edges);
  const [rfInstance, setRfInstance] = useState<null | ReactFlowInstance>(null);
  const { setViewport } = useReactFlow();
  const onNodesChangeCustom = (changes: NodeChange[]) => {
    return onNodesChange(changes)
  }

  const onEdgesChangeCustom = (changes: EdgeChange[]) => {
    return onEdgesChange(changes)
  }

  const initiated = (ref: any) => {
    setRfInstance(ref)
    if (props.positioned.viewport)
      setViewport(props.positioned.viewport)
  }

  const onConnect: OnConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'step', zIndex: 900, markerEnd: { type: MarkerType.ArrowClosed } }, eds)), []);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onSaveToFile = useCallback(async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      await props.api.patch(`/items/organizations/${props.organization.id}`, {
        organigram: flow
      })
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
      const saveNodes: string[] = []
      const syncedNodes: string[] = props.Pnodes.map(it=>it.id)
      const mutatedNodes = flow.nodes.filter((it:string)=>syncedNodes.includes(it.id)).map((n: Node) => {
        saveNodes.push(n.id)
        n.data = props.Pnodes.find(it => it.id === n.id)?.data ?? n.data
        return n
      })
      const missingNodes: Node[] = props.Pnodes.filter(it=>!saveNodes.includes(it.id))
      const allNodes = [...mutatedNodes/*, ...missingNodes*/]
      setNodes(allNodes || []);
      setEdges(flow.edges || []);
      setViewport({ x, y, zoom });
    }

  }, [setNodes, setViewport]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = props.positioned;

      if (flow) {
        for (const ind of flow.nodes) {
          const fno: { data: any } | undefined = props.Pnodes.find(it => it.id === ind.id)
          ind.data = fno?.data || {}
        }
        //get new nodes in the yaml
        for (const ynd of props.Pnodes) {
          const found = flow.nodes.find((it: any) => it.id === ynd.id)
          if (!found) {
            flow.nodes.push(ynd)
          }
        }
        //delete nodes not in the yaml
        for (let nnd = 0; nnd < flow.nodes.length; nnd++) {
          const innd = flow.nodes[nnd]
          const found = props.Pnodes.find((it: any) => it.id === innd.id)
          if (!found) {
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

  const [guideVisible, setGuideVisible] = useState(true)

  const [updatedNodes, updateNodes] = useState([])

  const organigramContext = {
    guideVisible,
    setGuideVisible,
    updatedNodes,
    updateNodes
  }

  const fetchOrganization = async (date: string) => {
    const response = await props.api.get(`/organigram/${props.organization.id}`, {
      params: {
        date
      },
    });

    updateNodes(response.data.nodes)
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    fetchOrganization(date)
  }

  return (

    <div className='w-full h-screen bg-white'>
      <OrganigramContext.Provider value={organigramContext}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeCustom}
          onEdgesChange={onEdgesChangeCustom}
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
              <input type="date" onChange={handleDateChange} />
              <Button onClick={onSave}>save to cookie</Button>
              <Button onClick={onRestoreFromCookie}>reset</Button>
              <Button onClick={onSaveToFile}>save</Button>
              <Button onClick={onRestore}>restore</Button>
            </>}
            <DownloadButton />
          </Panel>

        </ReactFlow>
      </OrganigramContext.Provider>
    </div>

  );
};

export default (props: any) => <ReactFlowProvider>
  <OrganizationTree {...props} />
</ReactFlowProvider>;