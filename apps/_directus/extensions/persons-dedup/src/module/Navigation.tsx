import React from 'react'
import '../styles.css'
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Icon } from './Icon';

const navigation = [
  { name: 'Search person', href: '/persons-dedup', icon: UsersIcon },
  { name: 'Search saint', href: '/persons-dedup/saints', icon: UsersIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation({ router }) {
  const currentPath = router ? router.currentRoute.value.path : typeof window !== 'undefined' ? window.location.pathname : ''

  function handleClick(event, href) {
    if (!router) return
    event.preventDefault()
    router.push(href)
  }

  return (
    <nav aria-label="Sidebar" className="flex flex-1 flex-col">
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => {
          const isCurrent = currentPath === item.href
          return (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={(event) => handleClick(event, item.href)}
                aria-current={isCurrent ? 'page' : undefined}
                className={classNames(
                  isCurrent
                    ? 'bg-white text-indigo-600 dark:bg-white/5 dark:text-white'
                    : 'text-gray-700 hover:bg-white hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white',
                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={classNames(
                    isCurrent
                      ? 'text-indigo-600 dark:text-white'
                      : 'text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-white',
                    'size-6 shrink-0',
                  )}
                />
                {item.name}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
