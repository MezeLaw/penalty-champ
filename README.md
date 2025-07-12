# 🥅 Penalty Champion - Juego de Penales P2P

Un juego de penales en tiempo real donde dos jugadores pueden enfrentarse a través de conexiones peer-to-peer (P2P) directas.

## ✨ Características

- **Conexiones P2P**: Juego directo entre dos jugadores sin necesidad de servidor
- **Tiempo real**: Sincronización instantánea entre jugadores
- **Temporizador**: Máximo 5 segundos para elegir tu jugada
- **Roles alternos**: Los jugadores cambian entre pateador y portero
- **Interfaz intuitiva**: Diseño moderno y responsivo
- **Animaciones**: Efectos visuales para goles y atajadas

## 🎮 Cómo jugar

### 1. Crear una partida
- Haz clic en "Crear Partida"
- Comparte el código de partida con tu oponente
- Espera a que se conecte

### 2. Unirse a una partida
- Haz clic en "Unirse a Partida"
- Introduce el código de partida
- Conecta con tu oponente

### 3. Mecánica del juego
- **Pateador**: Elige dónde patear (izquierda, centro, derecha)
- **Portero**: Elige dónde atajar (izquierda, centro, derecha)
- Tienes máximo 5 segundos para decidir
- Los roles se alternan cada ronda
- Se juegan 5 rondas en total

### 4. Puntuación
- **Gol**: El pateador anota cuando el portero no adivina la dirección
- **Atajada**: El portero suma cuando adivina la dirección del disparo
- Gana quien tenga más puntos al final

## 🚀 Instalación y uso

### Método 1: Abriendo directamente
1. Descarga los archivos
2. Abre `index.html` en tu navegador
3. ¡Listo para jugar!

### Método 2: Servidor local (opcional)
```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js
npx http-server

# Luego abre http://localhost:8000
```

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil
- **Conexión**: Requiere internet para establecer conexión P2P inicial

## 🔧 Tecnologías utilizadas

- **HTML5**: Estructura del juego
- **CSS3**: Diseño y animaciones
- **JavaScript (ES6+)**: Lógica del juego
- **PeerJS**: Conexiones P2P WebRTC simplificadas

## 📋 Requisitos

- Navegador moderno con soporte para WebRTC
- Conexión a internet (solo para establecer conexión inicial)
- JavaScript habilitado

## 🎯 Características técnicas

- **Sincronización**: Ambos jugadores deben elegir antes de resolver la ronda
- **Timeout**: Si no eliges en 5 segundos, se selecciona "centro" automáticamente
- **Reconexión**: Si se pierde la conexión, se puede reiniciar el juego
- **Responsive**: Funciona en dispositivos móviles y desktop

## 🐛 Solución de problemas

### No puedo conectarme con mi oponente
- Verifica que ambos tengan buena conexión a internet
- Algunos firewalls corporativos pueden bloquear WebRTC
- Intenta desde una red diferente

### El juego se ve mal en móvil
- Asegúrate de usar un navegador moderno
- Rota el dispositivo a orientación vertical

### La conexión se pierde durante el juego
- Revisa tu conexión a internet
- Haz clic en "Jugar de Nuevo" para reiniciar

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Puedes:
- Reportar bugs
- Sugerir nuevas características
- Mejorar el código
- Añadir nuevas animaciones

## 📄 Licencia

Este proyecto es de código abierto. Siéntete libre de usar, modificar y distribuir.

---

**¡Que gane el mejor! ⚽** 