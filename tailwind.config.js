// tailwind.config.js
const { heroui } = require('@heroui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./resources/**/*.{js,jsx,ts,tsx,blade.php}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [
        require('tailwindcss-animate'),
        heroui({
            themes: {
                light: {
                    colors: {
                        background: '#FFFFFF',
                        foreground: '#11181C',
                        primary: {
                            50: '#E6F1FE',
                            100: '#CCE4FD',
                            200: '#99C9FB',
                            300: '#66AEF9',
                            400: '#3393F7',
                            500: '#006FEE',
                            600: '#0058BE',
                            700: '#00428F',
                            800: '#002B5F',
                            900: '#001530',
                            DEFAULT: '#006FEE',
                            foreground: '#FFFFFF',
                        },
                        secondary: {
                            50: '#F8F9FA',
                            100: '#F1F3F5',
                            200: '#E9ECEF',
                            300: '#DEE2E6',
                            400: '#CED4DA',
                            500: '#ADB5BD',
                            600: '#868E96',
                            700: '#495057',
                            800: '#343A40',
                            900: '#212529',
                            DEFAULT: '#868E96',
                            foreground: '#FFFFFF',
                        },
                    },
                },
                dark: {
                    colors: {
                        background: '#000000',
                        foreground: '#ECEDEE',
                        primary: {
                            50: '#001530',
                            100: '#002B5F',
                            200: '#00428F',
                            300: '#0058BE',
                            400: '#006FEE',
                            500: '#3393F7',
                            600: '#66AEF9',
                            700: '#99C9FB',
                            800: '#CCE4FD',
                            900: '#E6F1FE',
                            DEFAULT: '#006FEE',
                            foreground: '#FFFFFF',
                        },
                        secondary: {
                            50: '#212529',
                            100: '#343A40',
                            200: '#495057',
                            300: '#868E96',
                            400: '#ADB5BD',
                            500: '#CED4DA',
                            600: '#DEE2E6',
                            700: '#E9ECEF',
                            800: '#F1F3F5',
                            900: '#F8F9FA',
                            DEFAULT: '#868E96',
                            foreground: '#000000',
                        },
                    },
                },
            },
        }),
    ],
};
