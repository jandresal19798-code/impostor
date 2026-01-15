# 🎭 El Impostor

Un juego de deducción social perfeito para grupos de amigos. Un jugador es el impostor y debe descubrir la palabra secreta mientras los demás intentan encontrarlo.

![El Impostor](https://img.shields.io/badge/El-Impostor-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🎮 Cómo Jugar

1. **Setup**: Ingresa los nombres de 3-12 jugadores
2. **Categorías**: Elige entre General, Películas, Países o Comida
3. **Impostores**: Selecciona 1-3 impostores
4. **Revelación**: Cada jugador ve su rol en privado
5. **Debate**: Discuss y deduce quién miente
6. **Votación**: Votan para eliminar al impostor
7. **Resultados**: ¡Descubre si gana el equipo o los impostores!

## 🚀 Despliegue

### Opción 1: Render.com (Recomendado)

1. Sube este repositorio a GitHub
2. Crea una cuenta en [Render](https://render.com)
3. Crea un nuevo "Web Service":
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `.`
4. ¡Listo! Tu juego estará disponible en segundos

### Opción 2: Local

```bash
# Clona el repositorio
git clone <tu-repo-url>
cd impostor

# Instala dependencias
npm install

# Inicia el servidor
npm start

# Abre http://localhost:3000
```

### Opción 3: Static Hosting

Este proyecto también funciona como sitio estático. Solo necesitas servir la carpeta `public/` con cualquier servidor web (nginx, Apache, Vercel, Netlify, etc.).

## 📁 Estructura

```
impostor/
├── public/
│   ├── index.html      # Landing page
│   └── game.html       # Juego principal
├── server.js           # Servidor Express
├── package.json        # Dependencias
├── .gitignore          # Archivos ignorados
└── README.md           # Este archivo
```

## 🎯 Características

- ✅ Diseño responsive (móvil y desktop)
- ✅ 4 categorías con +110 palabras
- ✅ Sistema de votación integrado
- ✅ Temporizador para debates
- ✅ Múltiples impostores
- ✅ Efectos visuales y animaciones
- ✅ Totalmente en español

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework CSS**: Tailwind CSS (via CDN)
- **Backend**: Node.js + Express
- **Deployment**: Render / Vercel / Netlify

## 📝 Licencia

MIT License - Puedes usar este código libremente.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Agregar más palabras al juego
- Mejorar el diseño

---

<p align="center">
  Made with ❤️ for fun game nights
</p>
