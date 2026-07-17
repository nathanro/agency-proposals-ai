# Instrucciones de Despliegue - Agency Proposals AI

## ✅ Despliegue en Vercel Completado

**URL de Producción:** https://agency-proposals-ai.vercel.app

**Dashboard de Vercel:** https://vercel.com/nathans-projects-f6a0d9c4/agency-proposals-ai

### Variables de Entorno Configuradas ✅
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_GROK_OAUTH_TOKEN
- ✅ NEXT_PUBLIC_OPENPAYMENTS_WALLET_ADDRESS (vacío)
- ✅ OPENPAYMENTS_PRIVATE_KEY (vacío)

## 🔧 Setup de Supabase (PASO REQUERIDO)

El despliegue en Vercel está completo, pero **necesitas configurar la base de datos en Supabase** manualmente:

### Pasos para Configurar Supabase:

1. **Abrir el SQL Editor de Supabase**
   - Ve a: https://supabase.com/dashboard/project/afvssfbghiplneyjpmoh/sql/new
   - Inicia sesión si es necesario

2. **Ejecutar el Schema SQL**
   - Abre el archivo: `R:\Hermes-Workspace\proyectos\agency-proposals-ai\supabase-schema.sql`
   - Copia todo el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" o presiona Ctrl+Enter

3. **Verificar la Creación de Tablas**
   - Después de ejecutar el schema, deberías ver las siguientes tablas:
     - ✅ agencies
     - ✅ team_members
     - ✅ service_templates
     - ✅ proposals
     - ✅ projects
     - ✅ tasks
     - ✅ payments
     - ✅ white_label_configs

4. **Configurar Row Level Security (RLS)**
   - El schema ya incluye las políticas RLS básicas
   - Puedes ajustarlas según tus necesidades de seguridad

### Opcional: Configurar Auth de Supabase

1. **Habilitar Email Auth**
   - Ve a: https://supabase.com/dashboard/project/afvssfbghiplneyjpmoh/auth/providers
   - Habilita "Email" provider
   - Configura los emails de confirmación si es necesario

2. **Configurar Storage (Opcional)**
   - Ve a: https://supabase.com/dashboard/project/afvssfbghiplneyjpmoh/storage
   - Crea buckets para logos, documentos, etc.

## 🧪 Verificar el Despliegue

### 1. Verificar que el sitio esté funcionando
- Abre: https://agency-proposals-ai.vercel.app
- Deberías ver la landing page con el diseño

### 2. Verificar conexión con Supabase
- Después de ejecutar el schema SQL, el sitio debería poder conectarse a Supabase
- Las variables de entorno están configuradas correctamente

### 3. Verificar integración con Grok 4
- El token de Grok está configurado
- La generación de tareas con IA debería funcionar

## 🔄 Redesplegar si es Necesario

Si necesitas hacer cambios después de configurar Supabase:

```bash
cd "R:\Hermes-Workspace\proyectos\agency-proposals-ai"
vercel --prod
```

## 📝 Próximos Pasos

### 1. Desarrollo del MVP Funcional
- [ ] Sistema de autenticación completo
- [ ] Dashboard de agencia protegido
- [ ] CRUD de service templates
- [ ] Sistema de propuestas funcional
- [ ] Kanban board de tareas

### 2. Configuración de OpenPayments
- [ ] Crear wallet en OpenPayments
- [ ] Configurar wallet address en Vercel
- [ ] Configurar private key en Vercel
- [ ] Probar procesamiento de pagos

### 3. Sistema White-Label
- [ ] Configurar branding personalizado
- [ ] Configurar dominio personalizado
- [ ] Personalizar email templates

## 🚀 Para Escalar el Proyecto

### Dominio Personalizado
1. Compra dominio (ej: agency-proposals.com)
2. Ve a Settings > Domains en Vercel
3. Agrega tu dominio personalizado
4. Configura los DNS según instrucciones de Vercel

### Analytics
1. Ve a Analytics en Vercel
2. Habilita Web Vitals Analytics
3. Configura Google Analytics si lo deseas

### Monitoring
1. Configura uptime monitoring
2. Configura error tracking (Sentry, etc.)
3. Configura logs de Vercel

## 📞 Soporte

- **Vercel Dashboard**: https://vercel.com/nathans-projects-f6a0d9c4/agency-proposals-ai
- **Supabase Dashboard**: https://supabase.com/dashboard/project/afvssfbghiplneyjpmoh
- **URL Producción**: https://agency-proposals-ai.vercel.app

---

**Estado Actual:** ✅ Despliegue en Vercel completado, pendiente setup de Supabase
**Próxima Acción:** Ejecutar schema SQL en el SQL Editor de Supabase