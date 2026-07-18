# Agency Proposals AI

Sistema de automatización de propuestas y gestión de proyectos para agencias digitales con IA.

## 🚀 Características

- **Propuestas Inteligentes**: Crea propuestas basadas en templates de servicios personalizables
- **Generación de Tareas con IA**: Grok 4 genera automáticamente las tareas de entrega para cada servicio
- **Pagos Automatizados**: Integración con OpenPayments para procesar pagos sin intermediarios
- **Multi-Tenancy**: Sistema soporta múltiples agencias (white-label)
- **Dashboard Completo**: Gestión de proyectos, tareas y equipo en un solo lugar
- **Configuración White-Label**: Personalización completa de branding para reventa

## 🛠 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **IA**: Grok 4 (OAuth)
- **Pagos**: OpenPayments (Web Monetization)
- **Despliegue**: Railway/Vercel

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta de Supabase
- API Key de Grok 4
- Wallet de OpenPayments (opcional para MVP)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
cd R:\Hermes-Workspace\proyectos\agency-proposals-ai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar .env.local.example a .env.local
# Configurar las siguientes variables:
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_GROK_OAUTH_TOKEN=tu_grok_token
NEXT_PUBLIC_OPENPAYMENTS_WALLET_ADDRESS=tu_wallet_address
OPENPAYMENTS_PRIVATE_KEY=tu_private_key
```

4. **Configurar base de datos en Supabase**
- Abrir el SQL Editor en Supabase
- Ejecutar el script `supabase-schema.sql`

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
agency-proposals-ai/
├── src/
│   ├── app/              # Páginas Next.js (App Router)
│   ├── components/       # Componentes React
│   │   └── ui/          # Componentes UI reutilizables
│   ├── lib/             # Utilidades y servicios
│   │   ├── supabase.ts  # Cliente Supabase
│   │   ├── grok.ts      # Servicio Grok 4
│   │   ├── openpayments.ts # Servicio OpenPayments
│   │   └── utils.ts     # Utilidades generales
│   └── types/           # Definiciones TypeScript
├── supabase-schema.sql  # Schema de base de datos
└── package.json
```

## 🔧 Configuración

### Supabase

1. Crear un proyecto nuevo en [supabase.com](https://supabase.com)
2. Copiar URL y anon key al .env.local
3. Ejecutar el schema SQL en el SQL Editor
4. Configurar Row Level Security (RLS) según necesidad

### Grok 4

1. Obtener OAuth token de Grok
2. Configurar en variable de entorno
3. El sistema usa el modelo `grok-beta` para generación de tareas

### OpenPayments

1. Crear wallet en [openpayments.guide](https://openpayments.guide)
2. Configurar wallet address y private key
3. Para MVP, se puede usar modo manual sin OpenPayments

## 🎯 Uso

### Crear una Propuesta

1. Navegar a "Nueva Propuesta"
2. Seleccionar template de servicio
3. Personalizar para el cliente
4. Generar contenido con IA (opcional)
5. Enviar al cliente

### Procesar un Pago

1. Cliente paga vía link de OpenPayments
2. Webhook confirma el pago
3. Sistema crea automáticamente:
   - Proyecto
   - Tareas de entrega
   - Asignaciones al equipo

### Gestionar Proyecto

1. Ver dashboard de proyectos
2. Asignar tareas al equipo
3. Rastrear progreso
4. Marcar tareas completadas

## 🏗 Arquitectura

### Multi-Tenancy

El sistema usa un modelo de multi-tenancy a nivel de base de datos:
- Cada agencia tiene su propio ID
- Todas las tablas están relacionadas con `agency_id`
- RLS asegura que cada agencia solo vea sus datos

### Generación de Tareas con IA

1. Cuando se crea un template de servicio, Grok genera las tareas
2. Las tareas se almacenan en el template
3. Cuando se acepta una propuesta, las tareas se copian al proyecto
4. El equipo puede personalizar las tareas antes de ejecutar

### Flujo de Pagos

1. Propuesta → Link de pago OpenPayments
2. Cliente paga → Webhook
3. Verificación → Creación de proyecto
4. Generación de tareas → Asignación automática

## 🚀 Despliegue

### Railway

1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Desplegar automáticamente

### Vercel

1. Conectar repositorio a Vercel
2. Configurar build command: `npm run build`
3. Configurar variables de entorno
4. Desplegar

## 📝 Próximos Pasos

- [ ] Sistema de autenticación completo
- [ ] Dashboard de proyectos funcional
- [ ] Sistema de notificaciones
- [ ] Integración con calendario
- [ ] Reportes y analytics
- [ ] Sistema de tickets de soporte
- [ ] API para integraciones
- [ ] Móvil (React Native)

## 🤝 Contribución

Este es un proyecto privado de PubliExpert. Para contribuir, contactar a:
- Email: support@publiexpert.com
- Nathan Romano (Lead Developer)

## 📄 Licencia

Proprietary - Todos los derechos reservados para PubliExpert

## 💡 Soporte

Para soporte técnico:
- Email: support@publiexpert.com
- Documentación: Ver docs/ en el repositorio

---

Desarrollado con ❤️ por PubliExpert Agency