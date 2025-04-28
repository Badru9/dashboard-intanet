// tailwind.config.js
const { heroui } = require('@heroui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./resources/**/*.{js,jsx,ts,tsx,blade.php}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [require('tailwindcss-animate'), heroui()],
};
