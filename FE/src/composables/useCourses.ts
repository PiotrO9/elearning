import type { Course } from '../types/Course'

export function useCourses() {
    const mockCourses: Course[] = [
        {
            id: 1,
            title: 'Kompletny kurs Vue 3 i TypeScript',
            description:
                'Naucz się tworzyć nowoczesne aplikacje webowe używając Vue 3, Composition API i TypeScript od podstaw do zaawansowanych technik.',
            instructor: 'Anna Kowalska',
            thumbnail: '/placeholder.webp',
            tags: ['Vue 3', 'TypeScript', 'Composition API', 'Pinia'],
            isPopular: true,
        },
        {
            id: 2,
            title: 'UI/UX Design - Projektowanie interfejsów',
            description:
                'Poznaj zasady projektowania interfejsów użytkownika i doświadczenia użytkownika. Stwórz portfolio projektów.',
            instructor: 'Michał Nowak',
            thumbnail: '/placeholder.webp',
            tags: ['Figma', 'Prototyping', 'User Research', 'Wireframing'],
            isPopular: true,
        },
        {
            id: 3,
            title: 'Marketing w mediach społecznościowych',
            description:
                'Kompleksowy przewodnik po marketingu w mediach społecznościowych. Praktyczne strategie i narzędzia.',
            instructor: 'Katarzyna Wiśniewska',
            thumbnail: '/placeholder.webp',
            tags: ['Instagram', 'TikTok', 'Meta Ads', 'Content Marketing'],
            isPopular: true,
        },
        {
            id: 4,
            title: 'Node.js i Express - Backend Development',
            description:
                'Twórz skalowalne aplikacje backendowe używając Node.js, Express i MongoDB. Poznaj REST API i GraphQL.',
            instructor: 'Piotr Zieliński',
            thumbnail: '/placeholder.webp',
            tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
        },
        {
            id: 5,
            title: 'Fotografia produktowa dla e-commerce',
            description:
                'Naucz się robić profesjonalne zdjęcia produktów. Oświetlenie, kompozycja, obróbka zdjęć.',
            instructor: 'Magdalena Lewandowska',
            thumbnail: '/placeholder.webp',
            tags: ['Lightroom', 'Photoshop', 'Studio Setup', 'Retouching'],
        },
        {
            id: 6,
            title: 'Agile & Scrum - Zarządzanie projektami',
            description:
                'Poznaj metodyki Agile, Scrum i Kanban. Naucz się efektywnie zarządzać zespołem i projektami.',
            instructor: 'Robert Kamiński',
            thumbnail: '/placeholder.webp',
            tags: ['Scrum', 'Kanban', 'Jira', 'Team Management'],
        },
        {
            id: 7,
            title: 'Python dla Data Science',
            description:
                'Analiza danych z Python. Pandas, NumPy, Matplotlib i wprowadzenie do Machine Learning.',
            instructor: 'Tomasz Wojciechowski',
            thumbnail: '/placeholder.webp',
            tags: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
            isPopular: true,
        },
        {
            id: 8,
            title: 'Blender - Modelowanie 3D',
            description:
                'Od modelowania przez teksturowanie po rendering. Stwórz swoje pierwsze projekty 3D.',
            instructor: 'Aleksandra Szymańska',
            thumbnail: '/placeholder.webp',
            tags: ['Blender', '3D Modeling', 'Texturing', 'Rendering'],
        },
    ]

    function getCourseById(id: number): Course | undefined {
        return mockCourses.find((course) => course.id === id)
    }

    function getHomePageCourses(): Course[] {
        return mockCourses.filter((course) => course.isPopular).slice(0, 3)
    }

    function getAllCourses(): Course[] {
        return mockCourses
    }

    return {
        mockCourses,
        getCourseById,
        getAllCourses,
        getHomePageCourses,
    }
}
