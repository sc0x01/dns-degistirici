/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#fafafa',
                surface: '#ffffff',
                border: '#e5e7eb',
                primary: '#ea580c',
                'primary-hover': '#c2410c',
                'primary-light': '#fff7ed',
                text: '#0f172a',
                muted: '#64748b'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
