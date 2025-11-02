'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileMenuProps {
  profile: any
  userEmail: string
}

export default function ProfileMenu({ profile, userEmail }: ProfileMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/auth/login')
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const menuItems = [
    {
      icon: '👤',
      label: 'My Profile',
      href: '/profile',
      description: 'Edit your profile information',
    },
    {
      icon: '⚙️',
      label: 'Settings',
      href: '/settings',
      description: 'App preferences and privacy',
    },
    {
      icon: '🏠',
      label: 'Home',
      href: '/',
      description: 'Return to dashboard',
    },
    {
      icon: '✍️',
      label: 'Writing Studio',
      href: '/studio',
      description: 'Access writing tools',
    },
    {
      icon: '🧭',
      label: 'Path Finder',
      href: '/path-finder',
      description: 'Career decision tools',
    },
  ]

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-clay-rose flex items-center justify-center shadow-elevated hover:shadow-float transition-all duration-300 hover:scale-105 overflow-hidden"
      >
        {profile?.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl text-white">
            {profile?.full_name?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-float border-2 border-mist-teal animate-fade-in z-50">
          {/* Profile Header */}
          <div className="p-6 border-b border-sage-gray">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-clay-rose flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-white">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-black truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-sage-gray truncate">{userEmail}</p>
              </div>
            </div>
            {profile?.bio && (
              <p className="text-sm text-sage-gray mt-3 line-clamp-2">{profile.bio}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-3">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-sand-rose transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black">{item.label}</p>
                  <p className="text-xs text-sage-gray">{item.description}</p>
                </div>
              </a>
            ))}

            {/* Divider */}
            <div className="h-px bg-sage-gray my-2" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-red-50 transition-colors text-left"
            >
              <span className="text-2xl flex-shrink-0">🚪</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-600">Sign Out</p>
                <p className="text-xs text-sage-gray">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
