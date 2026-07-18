import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arena:  '#E9C46A',   // arena / tenis playa
        pista:  '#2A9D8F',    // pista / pádel
        noche:  '#0B1F3A',    // azul noche (marca)
        brasa:  '#E76F51'     // acento
      }
    }
  },
  plugins: []
}
export default config
