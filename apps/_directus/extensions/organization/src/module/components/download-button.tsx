import React from 'react';
import { Panel, useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';
import { Button } from './button';

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 4252;
const imageHeight = 2835;

function DownloadButton() {
  const { getNodes } = useReactFlow();

  const onClick = () => {

    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewportElement) {
      console.error('Viewport element not found');
      return;
    }
    toPng(viewportElement, {
      width: 4252,
      height: 2835,
      style: {
        width: '4252px',
        height: '2835px',
        transform: `translate(${transform[0]}px, ${transform[1]+200}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);

  };

  return (
      <Button className="download-btn" onClick={onClick}>
        Download Image
      </Button>
  );
}

export default DownloadButton;
