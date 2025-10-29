import type { useAuthStore } from '@/stores/auth'

export const links = [
    {
        name: 'Nawigacja',
        sublinks: [
            { name: 'Strona Główna', url: '/' },
            { name: 'Kursy', url: '/courses' },
            { name: 'O Nas', url: '/about' },
            { name: 'Kontakt', url: '/contact' },
            { name: 'Zaloguj Się', url: '/auth', isGuestOnly: true },
            { name: 'Zarejestruj Się', url: '/auth?mode=register', isGuestOnly: true },
            { name: 'Posiadane Kursy', url: '/profile/courses', isAuthRequired: true },
            { name: 'Profil', url: '/profile', isAuthRequired: true },
        ],
    },
    {
        name: 'Pomoc',
        sublinks: [
            { name: 'FAQ', url: '/faq' },
            { name: 'Wsparcie', url: '/support' },
            { name: 'Polityka Prywatności', url: '/privacy' },
            { name: 'Warunki Użytkowania', url: '/terms' },
        ],
    },
]

export const getVisibleLinks = function (
    authStore: ReturnType<typeof useAuthStore>,
    sublinks: (typeof links)[0]['sublinks'],
) {
    return sublinks.filter((link) => {
        // Hide auth-required links from guests
        if (link.isAuthRequired && !authStore.isAuthenticated) return false
        // Hide guest-only links from authenticated users
        if (link.isGuestOnly && authStore.isAuthenticated) return false
        return true
    })
}
