import React, {useContext, useCallback, useEffect} from 'react';
import { Panel, useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';
import { Button } from './button';
import OrganigramContext from './context';

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
  const { guideVisible, setGuideVisible } = useContext(OrganigramContext)

  const downloadCallback = useCallback((dataUrl: string)=>{
    downloadImage(dataUrl)

    setGuideVisible(true)
  }, [setGuideVisible])

  useEffect(()=>{

    if(!guideVisible) {
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
          width: '160cm',
          height: '100cm',
          transform: `translate(${transform[0]-100}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then(downloadCallback);
    }

  }, [guideVisible])

  const onClick = () => {
    setGuideVisible(false)
  };

  return (
      <Button className="download-btn" onClick={onClick}>
        Download Image
      </Button>
  );
}

export default DownloadButton;
