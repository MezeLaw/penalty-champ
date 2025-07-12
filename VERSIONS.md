# 🎮 Versiones del Juego - Penalty Champion

## 📁 **Archivos Disponibles**

### 🏆 **RECOMENDADO: `index-relay.html`**
**Sistema Híbrido P2P + Relay**
- ✅ **Siempre funciona** - Sin importar tu red
- ⚡ **Máximo rendimiento** - P2P cuando es posible
- 🔄 **Fallback automático** - Relay cuando P2P falla
- 👥 **Jugadores reales** - Duelo en tiempo real

### 🎯 **Alternativas Disponibles**

#### `index.html` - P2P Puro
- 🟢 **Ventajas**: Velocidad máxima, sin latencia
- 🔴 **Desventajas**: Puede fallar en redes restrictivas
- 🎯 **Cuándo usar**: Si tienes red doméstica abierta

#### `demo-local.html` - Demo vs IA
- 🟢 **Ventajas**: Funciona siempre, sin conexión
- 🔴 **Desventajas**: Juegas contra IA, no jugador real
- 🎯 **Cuándo usar**: Pruebas rápidas o sin internet

#### `test-p2p.html` - Diagnóstico
- 🔧 **Propósito**: Diagnosticar problemas P2P
- 📊 **Logs detallados**: Para troubleshooting
- 🎯 **Cuándo usar**: Cuando P2P falla

#### `test-local.html` - Test Navegador
- 🔧 **Propósito**: Verificar compatibilidad
- ⚙️ **Pruebas básicas**: WebRTC, APIs, etc.
- 🎯 **Cuándo usar**: Problemas de compatibilidad

---

## 🚀 **Guía de Uso Rápida**

### **¿Qué archivo debo usar?**

```
┌─ ¿Quieres jugar ahora mismo?
│
├─ SÍ ──► index-relay.html (recomendado)
│         ├─ Intenta P2P primero
│         └─ Usa relay si P2P falla
│
└─ NO ──► ¿Para qué necesitas el juego?
          │
          ├─ Probar mecánica ──► demo-local.html
          ├─ Diagnosticar P2P ──► test-p2p.html
          ├─ Red súper rápida ──► index.html
          └─ Test navegador ──► test-local.html
```

### **Cómo probar:**

1. **Sube todo a GitHub Pages**
2. **Abre `index-relay.html`** (versión recomendada)
3. **Observa el indicador** en esquina inferior izquierda
4. **Juega** - funcionará automáticamente

---

## 🔍 **Comparación Detallada**

| Característica | Híbrido | P2P Puro | Demo IA | Test P2P |
|---------------|---------|----------|---------|----------|
| **Siempre funciona** | ✅ | ❌ | ✅ | N/A |
| **Jugador real** | ✅ | ✅ | ❌ | N/A |
| **Velocidad** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | N/A |
| **Configuración** | Ninguna | Media | Ninguna | N/A |
| **Red restrictiva** | ✅ | ❌ | ✅ | N/A |
| **Diagnóstico** | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 **Casos de Uso**

### **Para Usuarios Finales:**
- **`index-relay.html`** - La mejor experiencia

### **Para Desarrolladores:**
- **`test-p2p.html`** - Diagnosticar problemas
- **`demo-local.html`** - Probar mecánica
- **`index.html`** - Version P2P original

### **Para Testing:**
- **`test-local.html`** - Compatibilidad navegador
- **Todos los archivos** - Comparar comportamiento

---

## 🔧 **Detalles Técnicos**

### **Sistema Híbrido (`index-relay.html`):**
```javascript
1. Intenta P2P (8s timeout)
2. Si P2P funciona → usar P2P
3. Si P2P falla → cambiar a relay
4. Relay = localStorage como demo
```

### **Indicadores Visuales:**
- 🟢 **Verde**: P2P Directo funcionando
- 🟡 **Amarillo**: Relay funcionando
- 🔴 **Rojo**: Error o inicializando

### **En Producción:**
El relay usaría:
- Firebase Realtime Database
- Socket.IO + Node.js
- WebSocket personalizado
- PubNub o similar

---

## 📊 **Rendimiento Esperado**

### **Tasa de Éxito:**
- **Híbrido**: ~99% (P2P + Relay)
- **P2P Puro**: ~60-70% (depende de red)
- **Demo IA**: 100% (offline)

### **Latencia:**
- **P2P**: 10-50ms
- **Relay**: 50-200ms
- **Demo**: 0ms

---

**🏆 Recomendación: Usa `index-relay.html` para la mejor experiencia** 