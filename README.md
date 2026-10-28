# 🚀 ORBITAL SOC — Cybersecurity Challenge

Bienvenido a **ORBITAL SOC**, un laboratorio práctico de ciberseguridad donde deberás investigar incidentes, analizar servicios y descubrir vulnerabilidades en una plataforma simulada de operaciones de seguridad.

El objetivo es completar las misiones identificando vulnerabilidades y encontrando las flags ocultas en el sistema.

## 📋 Requisitos

Antes de comenzar, asegúrate de tener instalado:

- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

Docker se encargará de ejecutar los servicios.

## 📥 1. Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/ThomasAlvarez31/CTF-2026-DUOC
```

Ingresa a la carpeta del proyecto:

```bash
cd CTF-2026-DUOC
```
## 🐳 2. Construir e iniciar el laboratorio

Desde la carpeta principal del proyecto, ejecuta:

```bash
docker compose up --build -d
```

Este comando construirá la imagen, instalará las dependencias necesarias e iniciará el laboratorio en segundo plano.

La primera ejecución puede tardar unos minutos dependiendo de tu conexión a Internet.

## 🌐 3. Acceder al laboratorio

Una vez iniciado, abre tu navegador y visita:

```text
http://localhost:3000
```

Deberías visualizar el panel principal de ORBITAL SOC.

<text>Si no puedes acceder, comprueba que Docker esté funcionando y que el contenedor se encuentre activo.</text>

## 🔎 4. Comprobar el estado del laboratorio

Para verificar que el contenedor está ejecutándose:

```bash
docker compose ps
```

Para revisar los registros del servidor:

```bash
docker compose logs -f
```

Para salir de la visualización de registros, presiona `Ctrl + C`. Esto no detiene el contenedor.

## 🎯 5. Objetivo del desafío

Durante el laboratorio encontrarás diferentes misiones relacionadas con vulnerabilidades web y seguridad informática.

Entre los conceptos que deberás investigar se encuentran:

- HTTP Headers Information Disclosure.
- Information Disclosure mediante `robots.txt`.
- Source Code Disclosure.
- SQL Injection.
- IDOR / BOLA.
- Network Trust Boundary.
- API Override.

Cada misión contiene información y evidencias que deberás analizar para encontrar su respectiva flag.

### ¿Qué es una flag?

Una flag es una cadena de texto que demuestra que encontraste y resolviste correctamente un desafío.

Su formato general es:

```text
FLAG{...}
```

Cuando encuentres una, guárdala y entrégala mediante el mecanismo de registro indicado por la organización.

**Importante:** cada participante debe resolver sus propios desafíos. No compartas tus flags con otros equipos.

## 🤖 6. Utilizar CyberBot

Dentro del laboratorio encontrarás un asistente llamado CyberBot.

Su función es orientarte durante las misiones mediante pistas progresivas y explicaciones relacionadas con las vulnerabilidades.

Si te encuentras bloqueado:

1. Lee nuevamente la descripción de la misión.
2. Revisa las evidencias disponibles.
3. Consulta CyberBot.
4. Utiliza sus pistas para orientar tu investigación.

Recuerda que CyberBot está diseñado para ayudarte a aprender, no para resolver automáticamente los desafíos.

## 🛠️ 7. Comandos útiles

| Acción | Comando |
|---|---|
| Iniciar el laboratorio | `docker compose up -d` |
| Construir e iniciar | `docker compose up --build -d` |
| Ver contenedores | `docker compose ps` |
| Ver registros | `docker compose logs -f` |
| Detener el laboratorio | `docker compose down` |
| Reiniciar el laboratorio | `docker compose restart` |

## ⚠️ 8. Solución de problemas

**El puerto 3000 ya está ocupado**

Otro programa podría estar utilizando el puerto. Comprueba qué servicio lo está ocupando y libera el puerto antes de iniciar el laboratorio.

**Docker no inicia**

Verifica que Docker Desktop esté abierto o que el servicio Docker esté activo en Linux.

**No puedo acceder a localhost:3000**

Comprueba el estado del contenedor:

```bash
docker compose ps
```

Si no está funcionando, revisa los registros:

```bash
docker compose logs
```

**Quiero volver a iniciar el laboratorio**

```bash
docker compose down
docker compose up --build -d
```

## 🔐 9. Reglas de participación

- Cada participante debe trabajar con su propio entorno asignado.
- No está permitido el uso de IA para la obtencion de flags.
- No está permitido modificar el código del laboratorio para obtener las flags.
- No se deben compartir flags ni soluciones completas.
- Todas las pruebas deben realizarse exclusivamente dentro del entorno autorizado.

Este laboratorio contiene vulnerabilidades intencionales con fines educativos. No expongas sus servicios a Internet ni los utilices contra sistemas reales.

---

**¡Buena suerte!**

Tu misión es investigar, comprender las vulnerabilidades y demostrar tus habilidades.

*ORBITAL SOC — Every signal tells a story.*
