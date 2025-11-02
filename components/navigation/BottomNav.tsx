'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      emoji: '🏠',
      color: 'bg-clay-rose',
    },
    {
      name: 'Studio',
      path: '/studio',
      emoji: '✍️',
      color: 'bg-mist-teal',
    },
    {
      name: 'Path',
      path: '/path-finder',
      emoji: '🧭',
      color: 'bg-sand-rose',
    },
    {
      name: 'Settings',
      path: '/settings',
      emoji: '⚙️',
      color: 'bg-sage-gray',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-float rounded-t-3xl z-50 pb-safe">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-all duration-300 ${
                active ? 'scale-110' : 'scale-100 hover:scale-105'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  active
                    ? `${item.color} shadow-elevated scale-110`
                    : `${item.color} opacity-30`
                }`}
              >
                <span className="text-2xl">
                  {item.emoji}
                </span>
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${
                  active ? 'text-black opacity-100' : 'text-sage-gray opacity-70'
                }`}
              >
                {item.name}
              </span>
              {active && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-clay-rose animate-scale-in" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
