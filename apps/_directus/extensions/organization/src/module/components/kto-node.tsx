import React, { memo, useRef, useState, useEffect, useContext } from 'react';
import { Handle, Position } from 'reactflow';
import moment from 'moment';
import ProfilePic from './profilepic';
import OrganigramContext from './context';

function Organization({ organization }: any) {
  if (!organization) {
    return null;
  }

  let ar = []
  if (organization.name) {
    ar.push(organization.name)
  }
  if (organization.patron) {
    ar.push('/')
    ar.push(organization.patron)
  }
  if (organization.level == 'Faritra') {
    return <div className='bg-yellow-300! font-bold! px-3! text-xl!'>
      {organization.role}
    </div>
  }
  return <div className='bg-lita-200! text-gray-100! px-3! text-xl!'>
    {ar.join(' ')}
  </div>
}

function CustomNode({ data }: any) {

  const router = useRef(data.router)

  delete data.router

  const [info, setInfo] = useState(data)
  const [derivedInfo, setDerivedInfo] = useState({})
  const [hidden, setHidden] = useState(false)
  
  const sizes = [
    'h-60! w-60!',
    'h-56! w-56!',
    'h-52! w-52!',
    'h-48! w-48!'
  ]

  useEffect(()=>{
    let size = info.rank < sizes.length ? sizes[info.rank] : 'h-44! w-44!';

    let title = null
    let fn = null
    let from = null
    let to = null
    let lastfunction = null
    let organization = null
    if (info.meta?.ecclesia.organizations && info.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.length)) {
      organization = info.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.length)
      lastfunction = organization?.functions[0]
      title = lastfunction.title ?? ''
      fn = lastfunction.function ?? ''
      const dateFrom = moment(lastfunction.from)
      if(dateFrom.month() === 0 && dateFrom.date()===1) {
        from = lastfunction.from ? (/^\d+$/.test(lastfunction.from) ? lastfunction.from : dateFrom.format('YYYY')) : ''
      }
      else {
        from = lastfunction.from ? (/^\d+$/.test(lastfunction.from) ? lastfunction.from : dateFrom.format('DD/MM/YYYY')) : ''
      }
      to = lastfunction.to ? (/^\d+$/.test(lastfunction.to) ? lastfunction.to : moment(lastfunction.to).format('DD/MM/YYYY')) : ''
    }

    setDerivedInfo({
      size,
      title,
      fn,
      from,
      to,
      organization
    })
  }, [info])

  const { updatedNodes } = useContext(OrganigramContext)

  useEffect(()=>{
    for(const updatedNode of updatedNodes) {
      setHidden(true)
      if(updatedNode.organization_id === info.organization_id && updatedNode.function_id === info.function_id) {
        setInfo(it=>({
          ...it,
          ...updatedNode
        }))
        setHidden(false)
        break;
      }
    }
    
  }, [updatedNodes])

  if(hidden) {
    return null
  }

  return (
    <div className="shadow-md rounded border border-default-300">
      {(info.rank > sizes.length && info.nodestyle?.organization_visible !== false) && <Organization organization={derivedInfo.organization} />}
      <div className='px-3! py-2!'>
        <div className="flex!">
          <div className="flex-shrink-0!">
            <ProfilePic size={derivedInfo.size} data={info} onChangePic={(url: string) => setInfo(it=>({...it, picture: url}))} />
          </div>
          <div className="ml-4! space-y-1!" onClick={()=>router.current.push(`/content/persons/${data.person_id}`)}>
            <div className="text-lg!">{derivedInfo.title}</div>
            <h3 className="text-xl! leading-6! text-gray-800! uppercase!">{info.lastname}</h3>
            <p className="text-2xl! font-semibold! text-gray-900!">
              {info.firstname}
            </p>
            <div className="text-xl!">{derivedInfo.fn}</div>
            <p className='italic text-xl!'>{derivedInfo.from} - {derivedInfo.to}</p>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 bg-teal-500 opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-16 bg-teal-500 opacity-0" />
      <Handle type="target" position={Position.Left} className="w-16 bg-teal-500 opacity-0" />
      <Handle type="source" position={Position.Right} className="w-16 bg-teal-500 opacity-0" />
    </div>
  );
}

export default memo(CustomNode);
