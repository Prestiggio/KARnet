import { getLocale, getTranslations } from "next-intl/server"
import LanguageSwitcher from "./LanguageSwitcher"
import {Link} from '@/i18n/navigation';

const navigation = {
  main: [
    { name: "Fampidirana", href: '/' },
    { name: "Fenitra ara-dalàna", href: '/legal-notice' },
    { name: "Fepetra samihafa", href: '/terms' },
    { name: "Zo tsiambarantelo", href: '/privacy' },
  ] as const,
  external: [
    { name: "Sehatra rindrambaiko", href: 'https://developer.katolika.net' }
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/katolika.net/',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://developer.katolika.net/?sc=fw',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
}

export default async function Footer() {

  const [__, locale] = await Promise.all([getTranslations(), getLocale()])

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-4 lg:px-8">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm/6">
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {__(item.name)}
            </Link>
          ))}
          {navigation.external.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {__(item.name)}
            </a>
          ))}
        </nav>
        <div className="flex flex-row justify-between">
          <div className="flex justify-center gap-x-6">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                className="text-gray-300 hover:text-gray-400 dark:text-gray-400 dark:hover:text-white"
              >
                <span className="sr-only">{__(item.name)}</span>
                <item.icon aria-hidden="true" className="size-6" />
              </a>
            ))}
          </div>
          <div className="flex justify-center gap-x-6">
            <LanguageSwitcher locale={locale}/>
          </div>
        </div>
        <p className="mt-2 text-center text-sm/6 text-gray-600 dark:text-gray-400">
          &copy; 2026 Apostolat Digital Katolika. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
