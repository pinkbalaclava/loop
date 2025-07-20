/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: '#075E54',
          secondary: '#128C7E',
          light: '#25D366',
          bg: '#ECE5DD',
          bubble: '#DCF8C6',
          received: '#FFFFFF'
        },
        loop: {
          primary: '#1E40AF',
          secondary: '#3B82F6',
          accent: '#F59E0B'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'typing': 'typing 1.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out'
      },
      keyframes: {
        typing: {
          '0%, 60%': { opacity: '1' },
          '30%': { opacity: '0.5' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}