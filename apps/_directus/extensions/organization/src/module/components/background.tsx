import React, { memo } from 'react';
import bg from '../../assets/images/ambatonilita-org-chart3.jpg';

function Background() {
  //return null
  /**
   * @todo load dynamically
   */
  return (
    <img src={bg} alt="background" width={8504} height={5670} style={{zoom:1, maxWidth:8504, marginLeft: 752, marginTop: 100}}/>
  );
}

export default memo(Background);
