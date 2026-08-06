import { createContext } from 'react';

const OrganigramContext = createContext({
    guideVisible: true,
    setGuideVisible: ()=>{},
    updatedNodes: [],
    updateNodes: ()=>{}
})

export default OrganigramContext