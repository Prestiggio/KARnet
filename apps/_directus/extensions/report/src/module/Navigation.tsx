import React from 'react'
import '../styles.css'
import './assets/fonts/kto.css'

const navigation = [
  { name: 'Alahady sy Litorjia', href: '/persons-dedup', icon: 'kto-eglizy', children: [
    {
      name: 'Litorjia',
      href: ''
    }
  ] },
  { name: 'Sakramenta', href: '/persons-dedup/saints', icon: 'kto-sakramenta' },
  { name: "Fikambanana Masina sy Vaomiera'asa", href: '/persons-dedup/saints', icon: 'kto-group' },
  { name: 'Sekoly sy Fanabeazana', href: '/persons-dedup/saints', icon: 'kto-school' },
  { name: 'Vola sy teti-bola', href: '/persons-dedup/saints', icon: 'kto-money' },
  { name: 'Fampivoaram-piainana', href: '/persons-dedup/saints', icon: 'kto-charity' }
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
                href="#"
                aria-current={isCurrent ? 'page' : undefined}
                className={classNames(
                  isCurrent
                    ? 'bg-white text-indigo-600 dark:bg-white/5 dark:text-white'
                    : 'text-gray-700 hover:bg-white hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white',
                  'group flex gap-x-3 rounded-md p-2 px-4! text-sm/6 font-semibold',
                )}
              >
                <i
                  aria-hidden="true"
                  className={classNames(isCurrent
                      ? 'text-indigo-600 dark:text-white'
                      : 'text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-white',
                    'size-6 shrink-0', 
                    `kto ${item.icon} text-xl! leading-none text-center`)}
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
