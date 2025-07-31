import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				golden: {
					50: '#fffbf0',
					100: '#fff6e0',
					200: '#ffedcc',
					300: '#ffe0b3',
					400: '#ffcd80',
					500: '#ffb84d',
					600: '#ff9e1a',
					700: '#e6890f',
					800: '#cc7a0d',
					900: '#b36b0b',
				},
				bronze: {
					50: '#fdf8f3',
					100: '#fbf0e6',
					200: '#f6e1cd',
					300: '#f0d1b4',
					400: '#e5b382',
					500: '#d99550',
					600: '#c7851e',
					700: '#b4770d',
					800: '#a16908',
					900: '#8e5b04',
				},
				earth: {
					50: '#faf9f7',
					100: '#f2f0eb',
					200: '#e6e1d7',
					300: '#d4ccba',
					400: '#bfb29b',
					500: '#a6977d',
					600: '#9a8870',
					700: '#80705e',
					800: '#695d50',
					900: '#564c42',
				}, 
				cloud: {
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#d4d4d8",
					400: "#e4e4e7",
					500: "#475569",
					600: "#334155",
					700: "#27272a",
					800: "#3f3f46",
					900: "#27272a",
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(255, 158, 26, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(255, 158, 26, 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in-left': 'slide-in-left 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			fontFamily: {
				'heading': ['Inter', 'sans-serif'],
				'body': ['Inter', 'sans-serif'],
			},
			boxShadow: {
				'golden': '0 4px 20px rgba(255, 158, 26, 0.2)',
				'golden-lg': '0 10px 40px rgba(255, 158, 26, 0.3)',
			}
		}
	},
	plugins: [
		plugin(function({ addComponents }) {
			addComponents({
				// Clase base para botones
				'.btn': {
					'@apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-300 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': {},
					// Tamaño por defecto (medium)
					'@apply px-6 py-3 text-base': {},
				},
				
				// Tamaños de botones
				'.btn-sm': {
					'@apply px-3 py-2 text-sm': {},
				},
				'.btn-lg': {
					'@apply px-8 py-4 text-lg': {},
				},
				
				// Colores de botones
				'.btn-primary': {
					'@apply bg-golden-600 text-white shadow-lg hover:bg-golden-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-golden-500': {},
				},
				'.btn-secondary': {
					'@apply bg-cloud-100 text-cloud-500 shadow-lg hover:bg-cloud-200  dark:bg-cloud-700 dark:text-cloud-300 dark:hover:bg-cloud-800 hover:shadow-xl hover:-translate-y-0.5 focus:ring-cloud-800': {},
				},
				'.btn-success': {
					'@apply bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-green-500': {},
				},
				'.btn-warning': {
					'@apply bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:shadow-xl hover:-translate-y-0.5 focus:ring-yellow-500': {},
				},
				'.btn-danger': {
					'@apply bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-red-500': {},
				},
				'.btn-info': {
					'@apply bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-blue-500': {},
				},
				'.btn-muted': {
					'@apply bg-gray-500 text-white shadow-lg hover:bg-gray-600 hover:shadow-xl hover:-translate-y-0.5 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700': {},
				},
			})
		})
	],
} satisfies Config;