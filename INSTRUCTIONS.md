# 🔧 Solución de Problemas P2P

## ❌ **Error: "Could not connect to peer"**

Este error es común en conexiones P2P. Aquí están las soluciones:

### 🚀 **Soluciones Rápidas**

1. **Ambos jugadores**: Recarguen la página
2. **Crear partida nuevamente**: Genera un código nuevo
3. **Cambiar de navegador**: Prueba Chrome, Firefox o Safari
4. **Conexión estable**: Verifica tu conexión a internet

### 🌐 **Problemas de Red**

#### **Firewall/NAT**
- Algunos routers bloquean conexiones P2P
- Intenta desde una red diferente (móvil, casa, trabajo)
- Redes corporativas suelen bloquear P2P

#### **Servicios que pueden interferir**
- VPN activa
- Proxy corporativo
- Antivirus con protección de red
- Extensiones de navegador (bloqueadores)

### 🔄 **Pasos para Conexión Exitosa**

1. **Jugador 1**: Abre el juego → "Crear Partida"
2. **Esperar**: Hasta que aparezca el código
3. **Jugador 2**: Abre el juego → "Unirse a Partida"
4. **Introducir código**: Exactamente como aparece
5. **Esperar**: Hasta 10 segundos para conectar

### 🛠️ **Troubleshooting Avanzado**

#### **Si sigues teniendo problemas:**

1. **Verifica la consola del navegador**:
   - F12 → Console
   - Busca errores específicos
   - Comparte el error en GitHub Issues

2. **Prueba en modo incógnito**:
   - Elimina conflictos con extensiones
   - Limpia caché temporal

3. **Diferentes dispositivos**:
   - Móvil vs Desktop
   - Diferentes ubicaciones

### 📱 **Compatibilidad**

#### **Navegadores Recomendados:**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (no soportado)

#### **Dispositivos:**
- ✅ Desktop/Laptop
- ✅ Móvil (Android/iOS)
- ✅ Tablet

### 🔧 **Versión Local (Alternativa)**

Si GitHub Pages no funciona, prueba localmente:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: Live Server (VSCode)
# Instala la extensión Live Server
```

### 🎯 **Demo Sin Conexión**

Mientras solucionas el P2P, puedes probar:
- Abre `demo-local.html`
- Juega contra la IA
- Misma mecánica, sin conexión

### 📞 **Reportar Problemas**

Si nada funciona:
1. Abre una [Issue en GitHub](tu-repo/issues)
2. Incluye:
   - Navegador y versión
   - Sistema operativo
   - Mensaje de error completo
   - Pasos que intentaste

### 🌟 **Alternativas P2P**

Si el problema persiste, considera:
- **Socket.IO**: Requiere servidor
- **Firebase Realtime**: Más complejo
- **WebSocket**: Necesita backend

---

**💡 Tip**: Las conexiones P2P funcionan mejor cuando ambos jugadores están en redes domésticas estables, usando navegadores modernos. 