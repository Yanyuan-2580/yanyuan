/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 — 温暖治愈的茶褐色系
        primary: {
          50: '#fef9f0',
          100: '#fdf0db',
          200: '#fae0b5',
          300: '#f5c87e',
          400: '#efb04c',
          500: '#e8992e',
          600: '#d17d1f',
          700: '#ad621c',
          800: '#8c4e1e',
          900: '#73411c',
        },
        // 暖橙色 — 用于强调和交互
        warm: {
          50: '#fef8ee',
          100: '#fdefd3',
          200: '#fbdaa4',
          300: '#f7bf6a',
          400: '#f3a03a',
          500: '#f0881c',
          600: '#e16d12',
          700: '#ba5311',
          800: '#944216',
          900: '#783815',
        },
        // 雾凇青 — 用于辅助和治愈感
        calm: {
          50: '#f3f7f4',
          100: '#e2ebe4',
          200: '#c5d7c9',
          300: '#9fbba6',
          400: '#759b7f',
          500: '#577f63',
          600: '#42654d',
          700: '#36513f',
          800: '#2e4234',
          900: '#26372c',
        },
        // 柔烟蓝 — 用于卡片和背景
        soft: {
          50: '#f7f8fb',
          100: '#eef1f7',
          200: '#dfe4ef',
          300: '#c5cde2',
          400: '#a6b0d0',
          500: '#8b95be',
          600: '#737aad',
          700: '#626898',
          800: '#54577d',
          900: '#474a65',
        },
        // 情绪色彩
        mood: {
          happy: '#7ebc89',
          neutral: '#d4b87a',
          sad: '#8ba4c4',
          angry: '#d4918a',
          anxious: '#b49ac7',
        }
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'nav': '0 -2px 20px rgba(0,0,0,0.03)',
        'soft': '0 4px 20px rgba(0,0,0,0.05)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"PingFang SC"', '"Microsoft YaHei"', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'breath': 'breath 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
