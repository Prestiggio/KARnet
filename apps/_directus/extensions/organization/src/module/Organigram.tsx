import React from 'react'
import '../styles.css'
import Tree from './components/tree'

export default function Navigation({ router, tree, positioned }) {
  return <Tree tree={tree} positioned={positioned}/>
}
