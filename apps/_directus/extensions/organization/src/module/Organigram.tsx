import React from 'react'
import '../styles.css'
import Tree from './components/tree'

export default function Navigation({ router, api, tree, positioned, organizationId }) {
  return <Tree tree={tree} positioned={positioned} router={router} organizationId={organizationId} api={api}/>
}
