import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import moment from 'moment';
import ProfilePic from './profilepic';

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
    return <div className='bg-yellow-300! font-bold! px-3!'>
      {organization.role}
    </div>
  }
  return <div className='bg-lita-200! text-gray-100! px-3!'>
    {ar.join(' ')}
  </div>
}

function CustomNode({ data }: any) {
  let size = 'h-24! w-24!';

  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.find((it2: { function: string }) => it2.function === 'Pape'))) {
    size = 'h-44! w-44!';
  }

  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.find((it2: { function: string }) => it2.function === 'Cardinal'))) {
    size = 'h-40! w-40!';
  }

  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any, title: string }) => it.functions && it.functions.find((it2: { function: string, title: string }) => it2.title === 'Monsenera'))) {
    size = 'h-36! w-36!';
  }

  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.find((it2: { function: string }) => it2.function === 'Curé'))) {
    size = 'h-32! w-32!';
  }

  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.find((it2: { function: string, title: string }) => it2.title === 'vicaire'))) {
    size = 'h-28! w-28!';
  }

  let title = null
  let fn = null
  let from = null
  let to = null
  let lastfunction = null
  let organization = null
  if (data.meta?.ecclesia.organizations && data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.length)) {
    organization = data.meta.ecclesia.organizations.find((it: { functions: any }) => it.functions && it.functions.length)
    lastfunction = organization?.functions[0]
    title = lastfunction.title ?? ''
    fn = lastfunction.function ?? ''
    from = lastfunction.from ? (/^\d+$/.test(lastfunction.from) ? lastfunction.from : moment(lastfunction.from).format('DD/MM/YYYY')) : ''
    to = lastfunction.to ? (/^\d+$/.test(lastfunction.to) ? lastfunction.to : moment(lastfunction.to).format('DD/MM/YYYY')) : ''
  }
  return (
    <div className="shadow-md rounded border border-default-300">
      <Organization organization={organization} />
      <div className='px-4! py-2!'>
        <div className="flex!">
          <div className="flex-shrink-0!">
            <ProfilePic size={size} data={data} onChangePic={(url: string) => data.picture = url} />
          </div>
          <div className="ml-4!">
            <span>{title}</span>
            <h3 className="text-base! leading-6! text-gray-800!">{data.lastname}</h3>
            <p className="text-xl! font-semibold! text-gray-900!">
              {data.firstname}
            </p>
            <span>{fn}</span>
            <p className='italic'>{from} - {to}</p>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 bg-teal-500 opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-16 bg-teal-500 opacity-0" />
    </div>
  );
}

export default memo(CustomNode);
