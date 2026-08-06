import React, { memo, useRef, useContext } from 'react';
import OrganigramContext from './context'

function Background({data}) {

  const router = useRef(data.router)

  delete data.router

  const { guideVisible } = useContext(OrganigramContext)

  if(guideVisible && data.data?.url) {
    return (
      <img src={data.data.url} alt="background" width={8504} height={5670} style={{zoom:1, maxWidth:8504, marginLeft: 752, marginTop: 100}}/>
    );
  }
  return null
}

export default memo(Background);
