import React, { memo } from 'react';
import ProfilePic from './image';

function CustomNode({ data }: any) {
  let size = 'w-24';
  return null;
  return (
    <ProfilePic size={size} data={data} onChangePic={(url:string)=>data.picture=url}/>
  );
}

export default memo(CustomNode);
