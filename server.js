const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======================================================
// DATABASE
// ======================================================
// The in-memory database is intentionally reset on restart.
// Keep this environment isolated: the challenges are deliberately vulnerable.
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INT,
      username TEXT,
      password TEXT,
      role TEXT,
      email TEXT,
      last_login TEXT
    )
  `);

  db.run(`
    INSERT INTO users VALUES
    (1, 'admin', 'SecOps_Pass_9921', 'admin',
     'admin.secops@corp-internal.net', '2026-10-26 14:22:10')
  `);

  db.run(`
    INSERT INTO users VALUES
    (2, 'analyst', 'analyst2026', 'user',
     't.analyst@corp-internal.net', '2026-10-26 18:05:40')
  `);
});

// ======================================================
// DYNAMIC FLAGS — prefixes and salts preserved
// ======================================================
function generateDynamicFlag(prefix, secretValue) {
  const hash = crypto
    .createHash('sha256')
    .update(secretValue)
    .digest('hex')
    .substring(0, 10)
    .toUpperCase();

  return `FLAG{${prefix}_${hash}}`;
}

// ======================================================
// GLOBAL VISUAL SYSTEM — ORBITAL / MISSION CONTROL
// ======================================================
const globalCSS = `
:root {
  color-scheme: dark;
  --bg: #050d18;
  --panel: #0b1929;
  --panel-2: #10243a;
  --panel-3: #142d46;
  --line: #203d58;
  --line-soft: rgba(106, 168, 210, .16);
  --blue: #63b8f2;
  --cyan: #66e0f2;
  --green: #57d6ad;
  --amber: #f2bd68;
  --red: #f17d82;
  --text: #e8f1fa;
  --muted: #8da4b9;
  --dim: #5e7890;
  --shadow: 0 18px 55px rgba(0,0,0,.28);
}
* { box-sizing: border-box; }
html { min-height: 100%; background: var(--bg); }
body {
  margin: 0; min-height: 100vh; color: var(--text);
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  background:
    radial-gradient(ellipse at 50% -20%, rgba(39,100,151,.28), transparent 52%),
    linear-gradient(180deg, #071321 0%, #050c16 70%, #040a12 100%);
}
body:before {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1;
  opacity: .16;
  background-image: linear-gradient(rgba(104,160,203,.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(104,160,203,.08) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}
a { color: var(--blue); text-decoration: none; }
a:hover { color: #a5dcff; }
button, input { font: inherit; }
button { cursor: pointer; }
.topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; padding: 13px clamp(16px, 3vw, 46px);
  background: rgba(5,13,24,.91); backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(91,151,195,.25);
}
.brand { display: flex; align-items: center; gap: 12px; color: white; min-width: 220px; }
.brand-mark {
  display: grid; place-items: center; width: 38px; height: 38px;
  border: 1px solid #39749e; border-radius: 10px;
  color: var(--cyan); background: linear-gradient(145deg,#173b58,#0b1c2e);
  box-shadow: inset 0 0 18px rgba(102,224,242,.08), 0 0 22px rgba(60,160,215,.08);
  font-size: 19px;
}
.brand-name { font: 700 13px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1.8px; }
.brand-sub { margin-top: 4px; color: var(--dim); font: 9px ui-monospace, monospace; letter-spacing: 1.4px; }
.nav-links { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.nav-links a {
  padding: 9px 11px; border: 1px solid transparent; border-radius: 6px;
  color: #91a9be; font: 10px ui-monospace, monospace; letter-spacing: .9px;
}
.nav-links a:hover, .nav-links a.active { color: #e9f8ff; background: #10243a; border-color: #244765; }
.top-status { display: flex; align-items: center; gap: 8px; color: #8eb7a9; font: 9px ui-monospace, monospace; letter-spacing: 1px; white-space: nowrap; }
.pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 12px var(--green); animation: pulse 2s infinite; }
@keyframes pulse { 50% { opacity: .35; box-shadow: 0 0 3px var(--green); } }
.main-container { width: min(1500px, 94%); margin: 28px auto 55px; }
.eyebrow { color: var(--cyan); font: 9px ui-monospace, monospace; letter-spacing: 2px; text-transform: uppercase; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 18px; margin-bottom: 20px; }
.page-heading h1 { margin: 7px 0 5px; color: #f3f8ff; font-size: clamp(20px, 2.2vw, 29px); font-weight: 650; letter-spacing: -.5px; }
.page-heading p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
.status-chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid #285743; border-radius: 6px; color: #8ce0bc; background: rgba(26,105,75,.12); font: 9px ui-monospace, monospace; letter-spacing: 1px; }
.panel, .card {
  min-width: 0; padding: 18px; border: 1px solid var(--line);
  border-radius: 9px; background: linear-gradient(145deg, rgba(13,29,47,.97), rgba(8,20,34,.97));
  box-shadow: var(--shadow);
}
.panel + .panel, .card + .card { margin-top: 14px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
.panel-head h2 { margin: 0; color: #d7e8f7; font: 600 10px ui-monospace, monospace; letter-spacing: 1.2px; }
.panel-tag { color: #79b9df; font: 9px ui-monospace, monospace; letter-spacing: .8px; white-space: nowrap; }
.metrics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; margin-bottom: 14px; }
.metric {
  position: relative; overflow: hidden; padding: 16px; border: 1px solid #23415d;
  border-radius: 8px; background: linear-gradient(145deg,#112a43,#0b1a2c);
}
.metric:after { content:""; position:absolute; top:0; right:0; width:70px; height:70px; background: radial-gradient(circle,rgba(98,190,239,.12),transparent 70%); }
.metric-label { color: #8da7bd; font: 9px ui-monospace, monospace; letter-spacing: 1.1px; }
.metric-value { margin-top: 10px; color: #f2f8ff; font: 700 25px ui-monospace, monospace; }
.metric-note { margin-top: 5px; color: #68839b; font-size: 10px; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(280px,.8fr); gap: 14px; }
.side-stack { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
#worldMap { width: 100%; height: 340px; display: block; border: 1px solid #1d3b57; border-radius: 7px; background: radial-gradient(ellipse at center,#102d49,#071421 75%); }
#radarCanvas { display: block; width: min(100%,290px); height: auto; margin: 0 auto; }
#trafficChart { width: 100%; height: 180px; display: block; }
.legend { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 12px; color: #829cb2; font: 9px ui-monospace, monospace; }
.legend i { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; }
.module-list { display: grid; gap: 8px; }
.module-item { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 11px 12px; border: 1px solid #203b55; border-radius: 6px; background: rgba(17,39,61,.72); }
.module-item strong { color: #d5e5f2; font-size: 10px; font-weight: 600; }
.module-item small { display: block; margin-top: 4px; color: #7892a9; font-size: 9px; }
.module-state { color: var(--green); font: 9px ui-monospace, monospace; white-space: nowrap; }
.event-stream { max-height: 230px; overflow: auto; }
.event-row { display: grid; grid-template-columns: 66px 45px 1fr; gap: 8px; padding: 10px 2px; border-bottom: 1px solid rgba(81,126,163,.15); font: 9px ui-monospace, monospace; }
.event-time { color: #66839b; }
.event-info { color: #c0d2e1; }
.event-ok { color: var(--green); } .event-warn { color: var(--amber); } .event-critical { color: var(--red); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 650px; }
th { padding: 11px 10px; color: #82a7c2; background: rgba(57,129,177,.08); text-align: left; font: 9px ui-monospace, monospace; letter-spacing: 1px; }
td { padding: 12px 10px; border-bottom: 1px solid rgba(85,129,165,.15); color: #b8cada; font-size: 11px; }
tr:hover td { background: rgba(91,170,218,.035); }
.level { font: 9px ui-monospace, monospace; letter-spacing: .6px; }
.level.easy { color: var(--green); } .level.medium { color: var(--amber); } .level.hard { color: var(--red); }
.action-link { color: #79c9f5; font: 9px ui-monospace, monospace; letter-spacing: .7px; }
.directory-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.directory-entry { display:flex; align-items:center; gap:12px; padding:12px; border:1px solid #203d58; border-radius:7px; background:#0d2033; }
.avatar { display:grid; place-items:center; width:34px; height:34px; border-radius:8px; background:#173a56; color:#9ddfff; font:700 12px ui-monospace,monospace; }
.directory-entry strong { display:block; color:#dbeaf6; font-size:11px; }
.directory-entry small { display:block; margin-top:4px; color:#7892a9; font:9px ui-monospace,monospace; }
.footer {
  display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;
  margin-top:18px; padding:13px 2px; border-top:1px solid var(--line-soft);
  color:#607b93; font:9px ui-monospace,monospace; letter-spacing:.6px;
}
.status-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:14px; }
.status-item { padding:14px; border:1px solid #23415d; border-radius:7px; background:#10243a; text-align:center; }
.status-item small { color:#88a2b9; font:9px ui-monospace,monospace; letter-spacing:.7px; }
.status-item strong { display:block; margin-top:8px; color:#e9f6ff; font:700 15px ui-monospace,monospace; }
.status-canvas { width:100%; height:260px; display:block; border:1px solid #1e3d59; border-radius:7px; background:#06111e; }
.flag-box { padding:14px; border:1px solid #28684f; border-radius:7px; background:#071810; color:#83e6ba; font:12px ui-monospace,monospace; overflow-wrap:anywhere; }
.form-label { display:block; margin:14px 0 6px; color:#9bb2c6; font:9px ui-monospace,monospace; letter-spacing:.8px; }
input { width:100%; padding:12px; color:#eff8ff; background:#071522; border:1px solid #294660; border-radius:6px; outline:none; }
input:focus { border-color:#63b8f2; box-shadow:0 0 0 3px rgba(99,184,242,.1); }
.primary-btn { width:100%; margin-top:16px; padding:12px 15px; border:1px solid #3977a3; border-radius:6px; color:#eff9ff; background:linear-gradient(135deg,#1b5b87,#17436b); font:600 10px ui-monospace,monospace; letter-spacing:1px; }
.primary-btn:hover { filter:brightness(1.18); }
.notice { padding:12px 14px; border:1px solid #29465f; border-radius:6px; background:#0d2033; color:#9bb2c6; font-size:11px; line-height:1.65; }
.notice strong { color:#d9efff; }
#bot-container { position:fixed; right:22px; bottom:20px; z-index:1000; }
#bot-launcher {
  display:flex; align-items:center; gap:10px; width:auto; padding:12px 16px;
  border:1px solid #39769d; border-radius:30px; color:#e9f8ff;
  background:linear-gradient(135deg,#173b58,#10263d);
  box-shadow:0 10px 35px rgba(0,0,0,.45),0 0 24px rgba(81,183,230,.09);
  font:600 10px ui-monospace,monospace; letter-spacing:.8px;
}
.bot-orb { display:grid; place-items:center; width:25px; height:25px; border-radius:50%; color:#8cecff; background:#1c4b68; box-shadow:inset 0 0 12px rgba(102,224,242,.2); }
#bot-window {
  display:none; position:absolute; right:0; bottom:62px; width:370px; max-width:calc(100vw - 28px);
  overflow:hidden; border:1px solid #31536f; border-radius:11px;
  background:#091827; box-shadow:0 24px 75px rgba(0,0,0,.68);
}
.bot-header { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:linear-gradient(110deg,#173650,#10263b); border-bottom:1px solid #2b4a64; }
.bot-title { color:#f0f8ff; font:700 11px ui-monospace,monospace; letter-spacing:1px; }
.bot-subtitle { margin-top:4px; color:#8aa9c0; font:8px ui-monospace,monospace; letter-spacing:1px; }
.bot-close { width:auto; padding:4px 8px; color:#9bb4c8; background:transparent; border:0; font-size:16px; }
.bot-body { max-height:min(70vh,600px); overflow:auto; padding:15px; }
.bot-intro { margin:0 0 12px; color:#9bb3c7; font-size:11px; line-height:1.6; }
.bot-mission { margin-bottom:12px; padding:9px 10px; border:1px solid #25445f; border-radius:6px; background:#0e2236; color:#80c9ef; font:9px ui-monospace,monospace; letter-spacing:.7px; }
.bot-options { display:grid; gap:7px; }
.bot-option {  display:flex; align-items:center; gap:10px; width:100%; padding:10px;
  border:1px solid #29445d; border-radius:7px; text-align:left;
  color:#d5e5f2; background:#102338; font-size:10px;
}
.bot-option:hover { border-color:#4b8bb4; background:#15304a; }
.bot-option .option-icon { display:grid; place-items:center; flex:0 0 25px; height:25px; border-radius:6px; color:#8cddf6; background:#173b55; font:12px ui-monospace,monospace; }
.bot-option small { display:block; margin-top:3px; color:#819bb1; font-size:9px; font-weight:400; }
.bot-conversation { display:grid; gap:9px; margin-top:13px; }
.bot-message { padding:11px 12px; border-radius:7px; font-size:10px; line-height:1.65; white-space:pre-line; }
.bot-message.bot { border:1px solid #25445d; color:#c8dce9; background:#10243a; }
.bot-message.student { margin-left:25px; border:1px solid #315a78; color:#dff4ff; background:#12314a; }
.bot-message strong { color:#8cddf6; }
.bot-progress { display:flex; justify-content:space-between; gap:8px; margin-top:14px; color:#7e9bb2; font:8px ui-monospace,monospace; letter-spacing:.8px; }
.progress-track { display:flex; gap:4px; margin-top:7px; }
.progress-track span { flex:1; height:4px; border-radius:4px; background:#263d51; }
.progress-track span.on { background:#5bc9eb; box-shadow:0 0 8px rgba(91,201,235,.3); }
.bot-continue { width:100%; margin-top:10px; padding:10px; border:1px solid #3b708e; border-radius:6px; color:#a9e8f8; background:#12334a; font:9px ui-monospace,monospace; letter-spacing:.7px; }
.bot-continue:disabled { opacity:.45; cursor:not-allowed; }
.bot-footer { margin-top:13px; padding-top:10px; border-top:1px solid #20394f; color:#5f7b92; text-align:center; font:8px ui-monospace,monospace; letter-spacing:1px; }
@media(max-width:950px) {
  .dashboard-grid { grid-template-columns:1fr; }
  .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(max-width:650px) {
  .topbar { align-items:flex-start; flex-direction:column; gap:10px; }
  .top-status { display:none; }
  .main-container { width:94%; margin-top:19px; }
  .metrics { gap:8px; }
  .metric { padding:12px; }
  .metric-value { font-size:21px; }
  #worldMap { height:230px; }
  .status-grid, .directory-grid { grid-template-columns:1fr; }
  #bot-container { right:12px; bottom:12px; }
}
`;

// ======================================================
// CYBERBOT — SOCRATIC, PROGRESSIVE, NOT AN ANSWER MACHINE
// ======================================================
const cyberBotScript = `
(() => {
  const mission = document.body.dataset.mission || 'general';
  const configs = {
    general: {
      title: 'CENTRO DE ORIENTACIÓN',
      intro: 'Puedo ayudarte a investigar. Elige qué te está costando y trabajaremos el razonamiento paso a paso.',
      concept: 'Cada misión evalúa una superficie distinta: respuestas HTTP, archivos públicos, código del cliente, identidad o lógica de aplicación.',
      evidence: 'Empieza identificando qué información entrega la página y qué información podría estar disponible fuera de lo que ves en pantalla.',
      question: '¿Qué observación concreta tienes hasta ahora? Intenta describir qué esperabas encontrar y qué encontraste realmente.',
      tools: 'Usa primero el navegador y sus herramientas de desarrollador. La pestaña Network permite observar solicitudes y respuestas; Elements y View Source sirven para examinar el contenido recibido.',
      check: 'Antes de probar algo nuevo, anota una hipótesis pequeña y cambia una sola variable. Así podrás saber qué produjo cada resultado.',
      clues: ['Elige una misión y revisa qué información te entrega el sistema.', 'Piensa en la diferencia entre lo que muestra la interfaz y lo que recibe el navegador.', 'Formula una hipótesis comprobable antes de modificar una solicitud.']
    },
    header: {
      title: 'MISSION 01 · NETWORK TELEMETRY',
      intro: 'El servicio de telemetría parece funcionar con normalidad. Tu tarea es auditar la respuesta completa, no solo su representación visual.',
      concept: 'HTTP es un protocolo de petición y respuesta. Una respuesta puede incluir un cuerpo visible, un código de estado y metadatos llamados cabeceras.',
      evidence: 'Compara lo que aparece en la página con los datos que el navegador recibe cuando carga el recurso. Pregúntate qué partes de una respuesta no se muestran como texto normal.',
      question: 'Si el contenido visible no contiene toda la información, ¿en qué otra parte de la respuesta HTTP buscarías metadatos?',
      tools: 'Abre las herramientas de desarrollador del navegador y observa la actividad de red. Selecciona la solicitud correspondiente y distingue entre Headers, Preview y Response.',
      check: 'Asegúrate de estar inspeccionando la solicitud correcta y la sección de cabeceras de respuesta, no las cabeceras que envía el navegador.',
      clues: ['Una respuesta HTTP tiene más componentes que el HTML que ves.', 'Distingue entre cabeceras de solicitud y cabeceras de respuesta.', 'Inspecciona los metadatos de la respuesta del recurso de telemetría y revisa si hay campos personalizados.']
    },
    robots: {
      title: 'MISSION 02 · RESOURCE EXPOSURE',
      intro: 'La estación mantiene archivos de configuración para clientes automatizados. Investiga qué información operativa podría quedar expuesta.',
      concept: 'Los archivos de directivas para rastreadores indican qué rutas deberían evitar ciertos bots. No son un mecanismo de control de acceso ni una barrera de seguridad.',
      evidence: 'Busca archivos públicos que describan cómo los rastreadores deben comportarse. Analiza si una ruta mencionada allí podría revelar la existencia de un recurso.',
      question: 'Si un archivo público recomienda a los rastreadores evitar una ruta, ¿eso significa que la ruta está protegida?',
      tools: 'Puedes usar la barra de direcciones del navegador para consultar recursos de texto y observar el contenido sin necesitar herramientas especiales.',
      check: 'No confundas una instrucción para rastreadores con una restricción aplicada por el servidor. Una ruta puede seguir siendo accesible.',
      clues: ['Investiga qué archivos suelen publicar los sitios para orientar a los rastreadores.', 'Lee las directivas como pistas sobre recursos, no como permisos.', 'Sigue la pista de recursos mencionados por el archivo y analiza qué información entrega el servidor.']
    },
    source: {
      title: 'MISSION 03 · INTELLIGENCE QUERY',
      intro: 'El terminal no muestra registros. Sin embargo, el navegador recibe un documento completo. Determina si hay información que la interfaz no representa.',
      concept: 'El código fuente HTML puede contener comentarios, metadatos y contenido que no aparece visualmente. Base64 es una codificación, no cifrado.',
      evidence: 'Compara la página renderizada con el documento HTML original. Presta atención a comentarios y cadenas que parezcan codificadas.',
      question: '¿Qué diferencia existe entre ocultar un dato de la vista y eliminarlo del documento que recibe el navegador?',
      tools: 'Usa la opción de ver código fuente de la página. Si encuentras una cadena codificada, identifica primero qué formato podría ser antes de intentar interpretarla.',
      check: 'No asumas que una cadena aparentemente ilegible está cifrada. Observa su alfabeto y estructura, y considera si se trata de una codificación reversible.',
      clues: ['El navegador recibe más que los elementos visibles.', 'Los comentarios HTML no se muestran como contenido normal.', 'Examina el documento original y analiza cualquier cadena codificada con una herramienta apropiada.']
    },
    idor: {
      title: 'MISSION 04 · IDENTITY RECORDS',
      intro: 'El servicio de perfiles expone registros de personal. Tu objetivo es evaluar si el sistema comprueba que cada operador solo consulte los recursos autorizados.',
      concept: 'Autenticación confirma quién eres; autorización determina qué puedes consultar. IDOR/BOLA aparece cuando el servidor no valida correctamente el acceso a un objeto solicitado mediante un identificador.',
      evidence: 'Observa cómo se identifica un perfil en una solicitud. Compara qué cambia entre dos registros y pregúntate si el servidor relaciona el identificador con los permisos del solicitante.',
      question: 'Si una aplicación recibe un identificador de registro, ¿qué debería verificar antes de devolver los datos?',
      tools: 'Inspecciona las solicitudes del servicio de perfiles desde el navegador. Lee los parámetros y compara cuidadosamente las respuestas de registros distintos.',
      check: 'Un identificador difícil de adivinar no reemplaza una comprobación de autorización. El servidor debe validar permisos en cada solicitud.',
      clues: ['Piensa en la diferencia entre conocer la identidad de una persona y tener permiso para ver sus datos.', 'Observa qué parte de la solicitud selecciona el perfil que devuelve la API.', 'Compara el comportamiento de los identificadores de registros y evalúa si el control de acceso se aplica en el servidor.']
    },
    sqli: {
      title: 'MISSION 05 · IAM DATABASE GATEWAY',
      intro: 'El portal IAM valida operadores contra una base de datos. Investiga cómo se relacionan los datos introducidos con la lógica de autenticación.',
      concept: 'SQL es un lenguaje para consultar bases de datos. En una consulta, las condiciones pueden combinarse con operadores lógicos como AND y OR. La inyección ocurre cuando datos externos alteran la estructura de una instrucción.',
      evidence: 'Observa cómo reacciona el formulario ante entradas normales y entradas con caracteres especiales. Diferencia un error de sintaxis de un rechazo normal de credenciales.',
      question: '¿Qué diferencia hay entre que una aplicación trate tu entrada como un dato y que la interprete como parte de una instrucción?',
      tools: 'Empieza con el formulario y el panel Network del navegador. Observa la respuesta del servidor. Para estudiar SQL, identifica primero SELECT, WHERE, AND y OR en una consulta sencilla.',
      check: 'No pruebes cadenas al azar. Cambia un solo carácter o condición cada vez y registra si la respuesta cambia, falla o permanece igual.',
      clues: ['Antes de atacar el formulario, comprende qué intenta comprobar una consulta de autenticación.', 'Las comillas delimitan valores de texto y los operadores lógicos modifican condiciones.', 'Investiga cómo una entrada puede cerrar un valor, modificar la lógica de una condición y afectar el resto de una consulta. No olvides estudiar el papel de los comentarios SQL.']
    },
    ip: {
      title: 'BONUS · NETWORK TRUST BOUNDARY',
      intro: 'Un panel administrativo decide si una solicitud procede de una red de confianza. Audita qué información utiliza para tomar esa decisión.',
      concept: 'Las cabeceras HTTP pueden transportar metadatos añadidos por proxies. Una aplicación no debería confiar ciegamente en valores que el cliente puede controlar.',
      evidence: 'Compara la dirección de conexión observada por el servidor con los metadatos que pueden acompañar una solicitud cuando hay proxies involucrados.',
      question: '¿Quién tiene autoridad para afirmar cuál es la IP de origen: el cliente que envía una cabecera o un proxy de confianza configurado por el servidor?',
      tools: 'Usa las herramientas de red del navegador o un cliente HTTP para estudiar las cabeceras. Investiga el propósito de los proxies inversos y cómo se configura una cadena de confianza.',
      check: 'Recuerda que una cabecera no se vuelve confiable solo por tener un nombre conocido. Importa quién la establece y qué proxies están autorizados.',
      clues: ['Investiga cómo una aplicación obtiene la dirección IP de una solicitud.', 'Aprende para qué se utiliza la información de IP reenviada por proxies.', 'Evalúa qué sucede si la aplicación acepta como confiable un metadato de red controlado por el cliente.']
    },
    api: {
      title: 'BONUS · API OVERRIDE',
      intro: 'Una interfaz de servicio conserva una operación de control. Analiza cómo los parámetros recibidos afectan la lógica de negocio.',
      concept: 'Una API recibe solicitudes y parámetros que pueden cambiar el comportamiento de una operación. La validación debe comprobar tanto el formato como los permisos y el estado permitido.',
      evidence: 'Observa qué parámetros acepta el servicio, qué errores devuelve y si la respuesta explica condiciones que faltan.',
      question: '¿Qué controles debería aplicar una API antes de aceptar una operación que modifica privilegios o estados?',
      tools: 'Inspecciona la respuesta JSON y compara solicitudes válidas e inválidas. Presta atención a nombres de parámetros, tipos de datos y mensajes de error.',
      check: 'No supongas que una operación está protegida solo porque no aparece en la interfaz. La API debe validar las reglas de negocio por sí misma.',
      clues: ['Empieza por entender qué parámetros influyen en la operación.', 'Compara la respuesta cuando faltan parámetros o tienen valores inesperados.', 'Investiga el riesgo de parámetros de depuración o de override expuestos en servicios de producción.']
    }
  };

  const cfg = configs[mission] || configs.general;
  const labels = [
    ['⌖', 'No sé por dónde empezar', 'Ayúdame a plantear una primera observación.'],
    ['◇', 'No entiendo el concepto', 'Necesito comprender la tecnología involucrada.'],
    ['⌘', 'No sé qué herramienta utilizar', 'Oriéntame sobre cómo investigar.'],
    ['?', 'He probado, pero no funciona', 'Quiero revisar mi razonamiento.'],
    ['↗', 'Necesito otra pista', 'Dame una orientación adicional, sin resolverlo por mí.']
  ];
  const actions = ['start','concept','tools','stuck','clue'];
  const launcher = document.getElementById('bot-launcher');
  const win = document.getElementById('bot-window');
  const close = document.getElementById('bot-close');
  const options = document.getElementById('bot-options');
  const conversation = document.getElementById('bot-conversation');
  const missionLabel = document.getElementById('bot-mission');
  const progressLabel = document.getElementById('bot-progress-label');
  const progressTrack = document.getElementById('bot-progress-track');
  const continueBtn = document.getElementById('bot-continue');
  if (!launcher || !win) return;

  missionLabel.textContent = cfg.title;
  launcher.addEventListener('click', () => { win.style.display = win.style.display === 'block' ? 'none' : 'block'; });
  close.addEventListener('click', () => { win.style.display = 'none'; });

  labels.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'bot-option';
    button.innerHTML = '<span class="option-icon"></span><span></span>';
    button.querySelector('.option-icon').textContent = item[0];
    const spans = button.querySelectorAll('span');
    spans[1].textContent = item[1];
    const small = document.createElement('small');
    small.textContent = item[2];
    spans[1].appendChild(small);
    button.addEventListener('click', () => respond(actions[index], item[1]));
    options.appendChild(button);
  });

  const stages = {};
  let activeAction = null;
  let activeStage = 0;
  let activeQuestion = '';

  function addMessage(kind, text) {
    const el = document.createElement('div');
    el.className = 'bot-message ' + kind;
    el.textContent = text;
    conversation.appendChild(el);
    conversation.scrollTop = conversation.scrollHeight;
  }

  function updateProgress(stage) {
    progressLabel.textContent = 'GUIDANCE LEVEL ' + stage + ' / 3';
    progressTrack.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const segment = document.createElement('span');
      if (i <= stage) segment.className = 'on';
      progressTrack.appendChild(segment);
    }
  }

  function respond(action, label) {
    activeAction = action;
    // Un único contador por misión: cambiar de botón no reinicia ni multiplica las pistas.
    const key = 'orbital-cyberbot-' + mission;
    let stage = Number(sessionStorage.getItem(key) || 0);
    if (stage >= 3) {
      addMessage('student', label);
      addMessage('bot', 'Ya hemos recorrido las orientaciones disponibles para este tema. Antes de pedir más ayuda, intenta explicar con tus propias palabras qué hipótesis estás comprobando y qué resultado esperas. También puedes revisar otra categoría de ayuda.');
      activeStage = 3;
      updateProgress(3);
      continueBtn.disabled = true;
      continueBtn.textContent = 'ORIENTACIÓN COMPLETADA';
      return;
    }
    stage += 1;
    sessionStorage.setItem(key, String(stage));
    activeStage = stage;
    addMessage('student', label);

    let response = '';
    if (action === 'start') {
      response = stage === 1
        ? 'Vamos por partes. ' + cfg.question + '\\n\\nNo intentes resolverlo todavía: primero identifica qué dato tienes y cuál te falta.'
        : stage === 2
          ? 'Una forma ordenada de empezar es describir la solicitud, el dato que controla el comportamiento y la respuesta recibida. ' + cfg.evidence + '\\n\\n¿Qué observación te parece más relevante?'
          : 'Plantea una hipótesis que puedas comprobar cambiando una sola variable. ' + cfg.check + '\\n\\nCuéntate qué resultado confirmaría o descartaría tu hipótesis antes de seguir.'
        ;
    } else if (action === 'concept') {
      response = stage === 1
        ? cfg.concept + '\\n\\nAhora intenta resumir la idea en una frase. ¿Qué parte de este concepto crees que podría estar relacionada con la misión?'
        : stage === 2
          ? cfg.concept + '\\n\\nConecta el concepto con una observación real del sistema: ¿qué dato, parámetro o respuesta podría demostrar que está ocurriendo?'
          : 'La conexión con esta misión es la siguiente: ' + cfg.evidence + '\\n\\nNo basta con memorizar la definición; intenta explicar por qué ese comportamiento podría representar un problema de seguridad.'
        ;
            } else if (action === 'tools') {
      response = stage === 1
        ? cfg.tools + '\\n\\nElige una herramienta y averigua primero qué información puede mostrarte.'
        : stage === 2
          ? 'Ya tienes una herramienta de partida. Úsala para observar una solicitud completa y registra tres cosas: qué enviaste, qué respondió el servidor y qué cambió entre intentos. ' + cfg.evidence
          : 'Ahora compara dos observaciones y evita cambiar varios elementos a la vez. ' + cfg.check + '\\n\\nLa herramienta no encuentra la vulnerabilidad por ti: te ayuda a reunir evidencia.'
        ;
    } else if (action === 'stuck') {
      response = stage === 1
        ? 'Detente un momento y revisa el proceso: ¿estás consultando el recurso correcto?, ¿la solicitud llegó al servidor?, ¿el resultado que recibiste coincide con lo que esperabas? ' + cfg.check
        : stage === 2
          ? 'Prueba a reducir el problema a una pregunta concreta. Comprueba el punto de partida, observa una sola variable y compara el resultado. ' + cfg.question
          : 'Si sigues sin avanzar, vuelve a la evidencia en lugar de probar al azar. ' + cfg.evidence + '\\n\\nEscribe en tus notas qué probaste, qué respuesta obtuviste y qué interpretación le diste.'
        ;
    } else {
      response = cfg.clues[stage - 1] + '\\n\\nAntes de continuar, piensa qué evidencia esperarías encontrar si esta orientación es correcta.';
    }

    addMessage('bot', response);
    updateProgress(stage);
    continueBtn.disabled = stage >= 3;
    continueBtn.textContent = stage >= 3 ? 'ORIENTACIÓN COMPLETADA' : 'HE REFLEXIONADO · CONTINUAR';
    activeQuestion = cfg.question;
  }

  continueBtn.addEventListener('click', () => {
    if (!activeAction || activeStage >= 3) return;
    addMessage('student', 'He revisado la orientación y quiero avanzar.');
    addMessage('bot', 'Bien. Antes de darte más información, comprueba tu hipótesis: ' + activeQuestion + '\\n\\nPuedes elegir una categoría distinta o solicitar otra pista. La siguiente orientación será más concreta, pero tendrás que interpretar la evidencia y realizar las pruebas.');
    continueBtn.disabled = true;
    continueBtn.textContent = 'ELIGE CÓMO CONTINUAR';
  });

  addMessage('bot', cfg.intro + '\\n\\nNo voy a entregarte una solución o una flag por pulsar un botón. Mi función es ayudarte a construir el razonamiento.');
  updateProgress(0);
})();
`;

// ======================================================
// GLOBAL LAYOUT
// ======================================================
function renderLayout(title, bodyContent, mission = 'general') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#071321">
  <title>${title} | ORBITAL SOC</title>
  <style>${globalCSS}</style>
</head>
<body data-mission="${mission}">
  <nav class="topbar">
    <a class="brand" href="/">
      <span class="brand-mark">✦</span>
      <span><span class="brand-name">ORBITAL // SOC</span><span class="brand-sub">SPACE OPERATIONS NETWORK</span></span>
    </a>
    <div class="nav-links">
      <a href="/">COMMAND</a>
      <a href="/status">TELEMETRY</a>
      <a href="/search">INTELLIGENCE</a>
      <a href="/auth">IDENTITY</a>
    </div>
    <div class="top-status"><span class="pulse-dot"></span> TRAINING SYSTEM ONLINE</div>
  </nav>

  <main class="main-container">${bodyContent}</main>

  <div id="bot-container">
    <section id="bot-window" aria-label="CyberBot assistance">
      <header class="bot-header">
        <div><div class="bot-title">✦ CYBERBOT // TRAINING ASSISTANT</div><div class="bot-subtitle">SOCRATIC GUIDANCE SYSTEM · KNOWLEDGE CORE</div></div>
        <button id="bot-close" class="bot-close" aria-label="Cerrar">×</button>
      </header>
      <div class="bot-body">
        <div id="bot-mission" class="bot-mission">MISSION CONTEXT</div>
        <p class="bot-intro">Selecciona el problema que estás teniendo. Las orientaciones se entregan gradualmente para que puedas razonar y experimentar.</p>
        <div id="bot-options" class="bot-options"></div>
        <div id="bot-conversation" class="bot-conversation" aria-live="polite"></div>
        <div class="bot-progress"><span id="bot-progress-label">GUIDANCE LEVEL 0 / 3</span><span>NO FLAG SPOILERS</span></div>
        <div id="bot-progress-track" class="progress-track"><span></span><span></span><span></span></div>
        <button id="bot-continue" class="bot-continue" disabled>ELIGE UNA OPCIÓN PARA COMENZAR</button>
        <div class="bot-footer">ORBITAL TRAINING DIVISION // THINK · TEST · LEARN</div>
      </div>
    </section>
    <button id="bot-launcher"><span class="bot-orb">✦</span> CYBERBOT ASSISTANCE</button>
  </div>

  <script>${cyberBotScript}</script>
</body>
</html>`;
}

// ======================================================
// DASHBOARD
// ======================================================
app.get('/', (req, res) => {
  const content = `
  <div class="page-heading">
    <div>
      <div class="eyebrow">ORBITAL OPERATIONS · TRAINING DIVISION</div>
      <h1>MISSION CONTROL CENTER</h1>
      <p>Centro de operaciones y evaluación de seguridad · Entorno de entrenamiento simulado</p>
    </div>
    <div class="status-chip"><span class="pulse-dot"></span> ALL SYSTEMS NOMINAL</div>
  </div>

  <section class="metrics">
    <div class="metric"><div class="metric-label">THREAT EVENTS</div><div class="metric-value" style="color:#f18a8d"><span id="threat-count">024</span></div><div class="metric-note">Simulated security events</div></div>
    <div class="metric"><div class="metric-label">NETWORK HEALTH</div><div class="metric-value" style="color:#69d8b2">98.7%</div><div class="metric-note">Infrastructure availability</div></div>
    <div class="metric"><div class="metric-label">ACTIVE NODES</div><div class="metric-value" style="color:#72c8f5">064 / 064</div><div class="metric-note">Global network topology</div></div>
    <div class="metric"><div class="metric-label">TRAFFIC LOAD</div><div class="metric-value" style="color:#b8a6f5"><span id="traffic-value">8.42</span></div><div class="metric-note">Gbps · Simulated telemetry</div></div>
  </section>

  <div class="dashboard-grid">
    <section class="panel">
      <div class="panel-head"><h2>GLOBAL NETWORK TOPOLOGY</h2><span class="panel-tag">GEO-NET / SIMULATED</span></div>
      <canvas id="worldMap" width="1200" height="420"></canvas>
      <div class="legend">
        <span><i style="background:#69c9f4"></i>NETWORK NODE</span>
        <span><i style="background:#59d7b0"></i>SECURE LINK</span>
        <span><i style="background:#f17d82"></i>ANOMALOUS NODE</span>
      </div>
    </section>

    <div class="side-stack">
      <section class="panel">
        <div class="panel-head"><h2>THREAT SCAN RADAR</h2><span class="panel-tag">ACTIVE SWEEP</span></div>
        <canvas id="radarCanvas" width="300" height="300"></canvas>
        <div class="metric-note" style="text-align:center">SECTOR 01–08 · 360° SCAN</div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>INFRASTRUCTURE STATUS</h2><span class="panel-tag">64 NODES</span></div>
        <div class="module-list">
          <div class="module-item"><div><strong>PERIMETER FIREWALL</strong><small>External network protection</small></div><span class="module-state">● ONLINE</span></div>
          <div class="module-item"><div><strong>IDENTITY SERVICES</strong><small>Authentication gateway</small></div><span class="module-state">● ONLINE</span></div>
          <div class="module-item"><div><strong>INTELLIGENCE ENGINE</strong><small>Threat analysis services</small></div><span class="module-state">● ONLINE</span></div>
          <div class="module-item"><div><strong>DATABASE CLUSTER</strong><small>Internal data services</small></div><span class="module-state">● ONLINE</span></div>
        </div>
      </section>
    </div>
  </div>

  <div class="dashboard-grid" style="margin-top:14px">
    <section class="panel">
      <div class="panel-head"><h2>NETWORK TRAFFIC ANALYTICS</h2><span class="panel-tag">ROLLING 60 SECONDS</span></div>
      <canvas id="trafficChart" width="900" height="200"></canvas>
      <div class="legend"><span><i style="background:#65bff0"></i>INBOUND</span><span><i style="background:#57d6ad"></i>OUTBOUND</span></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>SECURITY EVENT STREAM</h2><span class="panel-tag">SYSTEM LOGS</span></div>
      <div class="event-stream" id="event-stream">
        <div class="event-row"><span class="event-time">16:42:08</span><span class="event-ok">INFO</span><span class="event-info">NODE-04 CONNECTION ESTABLISHED</span></div>
        <div class="event-row"><span class="event-time">16:42:11</span><span class="event-warn">WARN</span><span class="event-info">UNUSUAL TRAFFIC PATTERN</span></div>
        <div class="event-row"><span class="event-time">16:42:15</span><span class="event-ok">INFO</span><span class="event-info">DATABASE CLUSTER HEALTHY</span></div>
        <div class="event-row"><span class="event-time">16:42:18</span><span class="event-critical">CRIT</span><span class="event-info">IAM AUTHENTICATION FAILURE</span></div>
      </div>
    </section>
  </div>

  <section class="panel" style="margin-top:14px">
    <div class="panel-head"><h2>SECURITY ASSESSMENT MISSIONS</h2><span class="panel-tag">TRAINING ENVIRONMENT</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>MISSION</th><th>CLASSIFICATION</th><th>AREA</th><th>STATUS</th><th>ACCESS</th></tr></thead>
        <tbody>
          <tr><td>Network Telemetry</td><td class="level easy">LEVEL 01 · BASIC</td><td>HTTP RESPONSE</td><td>AVAILABLE</td><td><a class="action-link" href="/status">OPEN →</a></td></tr>
          <tr><td>Resource Exposure</td><td class="level easy">LEVEL 01 · BASIC</td><td>PUBLIC RESOURCES</td><td>AVAILABLE</td><td><a class="action-link" href="/resource-audit">OPEN →</a></td></tr>
          <tr><td>Threat Intelligence</td><td class="level easy">LEVEL 02 · BASIC</td><td>HTML SOURCE</td><td>AVAILABLE</td><td><a class="action-link" href="/search">OPEN →</a></td></tr>
          <tr><td>Identity Records</td><td class="level medium">LEVEL 02 · INTERMEDIATE</td><td>API AUTHORIZATION</td><td>AVAILABLE</td><td><a class="action-link" href="/identity-records">OPEN →</a></td></tr>
          <tr><td>IAM Database Gateway</td><td class="level hard">LEVEL 03 · ADVANCED</td><td>SQL LOGIC</td><td>AVAILABLE</td><td><a class="action-link" href="/auth">OPEN →</a></td></tr>
          <tr><td>Network Trust Boundary</td><td class="level medium">BONUS</td><td>HTTP METADATA</td><td>OPTIONAL</td><td><a class="action-link" href="/admin-panel">INSPECT →</a></td></tr>
          <tr><td>API Override</td><td class="level hard">BONUS</td><td>BUSINESS LOGIC</td><td>OPTIONAL</td><td><a class="action-link" href="/api-override">OPEN →</a></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel" style="margin-top:14px">
    <div class="panel-head"><h2>PERSONNEL DIRECTORY SNAPSHOT</h2><span class="panel-tag">PUBLIC STAFF INDEX</span></div>
    <p style="margin:0 0 12px;color:#8da4b9;font-size:11px;line-height:1.6">Directorio de referencia del entorno de entrenamiento. Los identificadores son metadatos de registro, no credenciales ni permisos.</p>
    <div class="directory-grid">
      <div class="directory-entry"><span class="avatar">01</span><div><strong>System Administrator</strong><small>RECORD ID: 1 · ROLE: ADMIN</small></div></div>
      <div class="directory-entry"><span class="avatar">02</span><div><strong>Security Analyst</strong><small>RECORD ID: 2 · ROLE: USER</small></div></div>
    </div>
  </section>

  <div class="footer"><span>ORBITAL // SPACE OPERATIONS NETWORK</span><span>SIMULATED TELEMETRY · TRAINING ONLY</span><span id="soc-clock">--:--:-- UTC</span></div>

  <script>
  (() => {
    const map=document.getElementById('worldMap'), m=map.getContext('2d');
    const pts=[[.10,.30],[.17,.42],[.25,.27],[.33,.38],[.42,.24],[.50,.39],[.59,.28],[.67,.42],[.76,.29],[.86,.40],[.61,.68],[.45,.69],[.29,.66],[.17,.72]];
    const links=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[5,10],[10,11],[11,12],[12,13],[3,11],[4,10],[1,13]];
    let tick=0;
    function drawMap(){
      const w=map.width,h=map.height;m.clearRect(0,0,w,h);
      m.strokeStyle='rgba(105,174,218,.08)';m.lineWidth=1;
      for(let x=0;x<w;x+=40){m.beginPath();m.moveTo(x,0);m.lineTo(x,h);m.stroke();}
      for(let y=0;y<h;y+=40){m.beginPath();m.moveTo(0,y);m.lineTo(w,y);m.stroke();}
      m.fillStyle='rgba(50,104,145,.20)';
      const land=[[[.05,.20],[.15,.12],[.28,.20],[.29,.42],[.20,.55],[.16,.78],[.08,.58]],[[.33,.15],[.46,.14],[.52,.31],[.47,.45],[.50,.58],[.43,.83],[.36,.61]],[[.53,.17],[.73,.12],[.92,.25],[.86,.44],[.75,.49],[.70,.65],[.59,.49],[.54,.36]]];
      land.forEach(poly=>{m.beginPath();poly.forEach((p,i)=>i?m.lineTo(p[0]*w,p[1]*h):m.moveTo(p[0]*w,p[1]*h));m.closePath();m.fill();});
      links.forEach((l,i)=>{const a=pts[l[0]],b=pts[l[1]],x1=a[0]*w,y1=a[1]*h,x2=b[0]*w,y2=b[1]*h;m.beginPath();m.strokeStyle='rgba(83,191,231,.34)';m.moveTo(x1,y1);m.lineTo(x2,y2);m.stroke();const t=(tick/100+i*.19)%1;m.beginPath();m.fillStyle='#9beaff';m.arc(x1+(x2-x1)*t,y1+(y2-y1)*t,2.8,0,Math.PI*2);m.fill();});
      pts.forEach((p,i)=>{const x=p[0]*w,y=p[1]*h,r=4+Math.sin(tick/12+i)*1.5;m.beginPath();m.fillStyle=i===8?'#f17d82':'#69c9f4';m.arc(x,y,r,0,Math.PI*2);m.fill();m.beginPath();m.strokeStyle=i===8?'rgba(241,125,130,.45)':'rgba(105,201,244,.32)';m.arc(x,y,12+Math.sin(tick/10+i)*3,0,Math.PI*2);m.stroke();});
      tick++;requestAnimationFrame(drawMap);
    } drawMap();

    const radar=document.getElementById('radarCanvas'),r=radar.getContext('2d');let angle=0;
    const blips=[[70,80],[190,100],[135,205],[220,190],[95,175]];
    function drawRadar(){r.clearRect(0,0,300,300);r.strokeStyle='rgba(87,214,173,.32)';[35,70,105,140].forEach(v=>{r.beginPath();r.arc(150,150,v,0,Math.PI*2);r.stroke();});r.beginPath();r.moveTo(10,150);r.lineTo(290,150);r.moveTo(150,10);r.lineTo(150,290);r.stroke();r.save();r.translate(150,150);r.rotate(angle);const g=r.createRadialGradient(0,0,0,0,0,140);g.addColorStop(0,'rgba(87,214,173,.28)');g.addColorStop(1,'rgba(87,214,173,0)');r.fillStyle=g;r.beginPath();r.moveTo(0,0);r.arc(0,0,140,-.24,.24);r.closePath();r.fill();r.restore();blips.forEach((p,i)=>{r.fillStyle=Math.sin(angle*3+i)>.3?'#f17d82':'#57d6ad';r.beginPath();r.arc(p[0],p[1],3,0,Math.PI*2);r.fill();});angle+=.014;requestAnimationFrame(drawRadar);}drawRadar();

    const chart=document.getElementById('trafficChart'),c=chart.getContext('2d');
    let inbound=Array.from({length:60},()=>35+Math.random()*45),outbound=Array.from({length:60},()=>20+Math.random()*35);
    function drawChart(){const w=chart.width,h=chart.height;c.clearRect(0,0,w,h);c.strokeStyle='rgba(105,174,218,.12)';for(let i=1;i<5;i++){const y=h*i/5;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}function line(data,color){c.beginPath();data.forEach((v,i)=>{const x=i*w/(data.length-1),y=h-v/100*(h-15)-5;i?c.lineTo(x,y):c.moveTo(x,y);});c.strokeStyle=color;c.lineWidth=2;c.stroke();}line(inbound,'#65bff0');line(outbound,'#57d6ad');requestAnimationFrame(drawChart);}drawChart();
    const events=[['INFO','NODE-08 CONNECTION ESTABLISHED'],['INFO','NETWORK ROUTE OPTIMIZED'],['WARN','UNUSUAL TRAFFIC PATTERN DETECTED'],['INFO','FIREWALL RULESET SYNCHRONIZED'],['CRIT','AUTHENTICATION FAILURE'],['INFO','DATABASE CLUSTER HEALTHY'],['WARN','UNIDENTIFIED PACKET SEQUENCE'],['INFO','NODE-17 HEARTBEAT RECEIVED']];
    function addEvent(){const item=events[Math.floor(Math.random()*events.length)],row=document.createElement('div'),time=document.createElement('span'),type=document.createElement('span'),msg=document.createElement('span');row.className='event-row';time.className='event-time';time.textContent=new Date().toLocaleTimeString('en-GB');type.className=item[0]==='CRIT'?'event-critical':item[0]==='WARN'?'event-warn':'event-ok';type.textContent=item[0];msg.className='event-info';msg.textContent=item[1];row.append(time,type,msg);const stream=document.getElementById('event-stream');stream.prepend(row);while(stream.children.length>12)stream.lastElementChild.remove();}
    setInterval(addEvent,2800);
    setInterval(()=>{document.getElementById('traffic-value').textContent=(7.8+Math.random()*1.4).toFixed(2);inbound.push(30+Math.random()*60);outbound.push(18+Math.random()*48);inbound.shift();outbound.shift();},1000);
    function clock(){document.getElementById('soc-clock').textContent=new Date().toISOString().slice(11,19)+' UTC';}clock();setInterval(clock,1000);
  })();
  </script>`;
  res.send(renderLayout('Mission Control', content, 'general'));
});
// ======================================================
// MISSION 01 — HTTP RESPONSE HEADER
// ======================================================
app.get('/status', (req, res) => {
  const dynamicFlag = generateDynamicFlag('HTTP_HEADER', 'secret_salt_dashboard_2026');
  res.setHeader('X-Security-Audit-Flag', dynamicFlag);

  const content = `
  <div class="page-heading">
    <div><div class="eyebrow">MISSION 01 · NETWORK TELEMETRY</div><h1>NETWORK TELEMETRY CENTER</h1><p>Auditoría de integridad de comunicaciones · Cluster LOS_LAGOS_SEC_01</p></div>
    <div class="status-chip"><span class="pulse-dot"></span> SERVICE ONLINE</div>
  </div>
  <section class="panel">
    <div class="panel-head"><h2>NETWORK FABRIC VISUALIZATION</h2><span class="panel-tag">LIVE SIMULATION</span></div>
    <canvas id="neuralCanvas" class="status-canvas" width="1100" height="260"></canvas>
  </section>
  <div class="status-grid">
    <div class="status-item"><small>NETWORK LATENCY</small><strong style="color:#57d6ad">12 ms</strong></div>
    <div class="status-item"><small>INSPECTED PACKETS</small><strong style="color:#63b8f2" id="packet-counter">84,210</strong></div>
    <div class="status-item"><small>HEADER AUDIT</small><strong style="color:#f2bd68">ACTIVE</strong></div>
  </div>
  <div class="notice" style="margin-top:14px"><strong>OPERATIONAL NOTE</strong><br>El servicio informa que todos los nodos están reportando telemetría. Verifica la integridad de la respuesta completa.</div>
  <div class="footer"><span>ORBITAL // TELEMETRY NODE</span><span>MISSION 01</span><a href="/">← RETURN TO COMMAND</a></div>
  <script>
  (()=>{const canvas=document.getElementById('neuralCanvas'),ctx=canvas.getContext('2d');const nodes=Array.from({length:58},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*1.1,vy:(Math.random()-.5)*1.1,r:Math.random()*2+1}));function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let i=0;i<nodes.length;i++){for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y;if(Math.hypot(dx,dy)<125){ctx.strokeStyle='rgba(99,184,242,.16)';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>canvas.width)n.vx*=-1;if(n.y<0||n.y>canvas.height)n.vy*=-1;ctx.fillStyle='#67d9f2';ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();});requestAnimationFrame(draw);}draw();setInterval(()=>{const el=document.getElementById('packet-counter');el.textContent=(Number(el.textContent.replace(/,/g,''))+Math.floor(Math.random()*15)).toLocaleString();},1000);})();
  </script>`;
  res.send(renderLayout('Network Telemetry', content, 'header'));
});

// ======================================================

// Guided page for the robots.txt challenge; the file itself remains plain text.
app.get('/resource-audit', (req, res) => {
  const content = `
  <div class="page-heading">
    <div><div class="eyebrow">MISSION 02 · RESOURCE EXPOSURE</div><h1>PUBLIC RESOURCE AUDIT</h1><p>Investigación de archivos públicos y exposición de recursos.</p></div>
    <div class="status-chip">RESOURCE REVIEW</div>
  </div>
  <section class="panel">
    <div class="panel-head"><h2>CRAWLER POLICY REVIEW</h2><span class="panel-tag">PUBLIC RESOURCE</span></div>
    <p style="color:#9bb2c6;font-size:11px;line-height:1.7">La estación publica directivas para clientes automatizados. Revisa el archivo y determina si sus referencias revelan recursos que merecen una auditoría.</p>
    <div class="notice"><strong>INVESTIGATION TASK</strong><br>Identifica qué función cumple este tipo de archivo, qué información contiene y si una directiva de exclusión equivale realmente a un control de acceso.</div>
    <div style="margin-top:18px"><a class="primary-btn" style="display:block;text-align:center" href="/robots.txt" target="_blank" rel="noopener">OPEN PUBLIC CRAWLER POLICY →</a></div>
  </section>
  <div class="footer"><span>ORBITAL // RESOURCE EXPOSURE</span><span>MISSION 02</span><a href="/">← RETURN TO COMMAND</a></div>`;
  res.send(renderLayout('Resource Exposure', content, 'robots'));
});

// MISSION 02 — ROBOTS.TXT / BACKUP MANIFEST
// ======================================================
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /config/backup-manifest.json');
});

app.get('/config/backup-manifest.json', (req, res) => {
  const cleanFlag = generateDynamicFlag('ROBOTS_LEAK', 'secret_salt_robots_2026');
  res.json({
    status: 'success',
    environment: 'production_soc',
    version: '4.2.1',
    flag: cleanFlag
  });
});

// ======================================================
// MISSION 03 — HTML SOURCE / BASE64
// ======================================================
app.get('/search', (req, res) => {
  const rawFlag = generateDynamicFlag('SOURCE_CODE', 'secret_salt_source_2026');
  const b64Flag = Buffer.from(rawFlag).toString('base64');

  const content = `
  <!-- Internal audit reference: ${b64Flag} -->
  <div class="page-heading">
    <div><div class="eyebrow">MISSION 03 · THREAT INTELLIGENCE</div><h1>INTELLIGENCE QUERY TERMINAL</h1><p>Consulta de registros de inteligencia · Estado actual: sin resultados visibles</p></div>
    <div class="status-chip">QUERY ENGINE · IDLE</div>
  </div>
  <section class="panel" style="max-width:760px;margin:35px auto;text-align:center;padding:35px">
    <div class="eyebrow">INTELLIGENCE DIVISION</div>
    <h2 style="margin:13px 0;color:#f2bd68;font-size:19px">NO RECORDS AVAILABLE</h2>
    <p style="color:#9ab0c3;font-size:12px">No intelligence records are currently available for the requested search.</p>
    <div class="notice" style="margin:25px auto;max-width:470px;text-align:left;font-family:ui-monospace,monospace;font-size:10px">
      INTEL_ENGINE :: READY<br>DATABASE :: CONNECTED<br>QUERY_STATUS :: NO_RESULTS
    </div>
    <a class="action-link" href="/">← RETURN TO COMMAND</a>
  </section>`;
  res.send(renderLayout('Threat Intelligence', content, 'source'));
});

// ======================================================
// IDENTITY GATEWAY VIEW
// ======================================================
app.get('/auth', (req, res) => {
  const content = `
  <div class="page-heading">
    <div><div class="eyebrow">MISSION 05 · IDENTITY ACCESS MANAGEMENT</div><h1>UNIFIED AUTHENTICATION GATEWAY</h1><p>Portal de autenticación de operadores · IAM Gateway v4.2</p></div>
    <div class="status-chip"><span class="pulse-dot"></span> IAM SERVICE AVAILABLE</div>
  </div>
  <section class="panel" style="max-width:520px;margin:0 auto">
    <div class="panel-head"><h2>OPERATOR AUTHENTICATION</h2><span class="panel-tag">SECURE CHANNEL</span></div>
    <p style="color:#9bb2c6;font-size:11px;line-height:1.7">Authorized personnel only. Enter your operator credentials to continue.</p>
    <form action="/auth" method="POST">
      <label class="form-label" for="username">OPERATOR IDENTIFICATION</label>
      <input id="username" type="text" name="username" placeholder="Operator username" required autocomplete="off">
      <label class="form-label" for="password">ACCESS CREDENTIAL</label>
      <input id="password" type="password" name="password" placeholder="••••••••••••" required>
      <button class="primary-btn" type="submit">AUTHENTICATE OPERATOR</button>
    </form>
    <div class="footer"><span>IAM GATEWAY v4.2</span><a href="/">← RETURN TO COMMAND</a></div>
  </section>`;
  res.send(renderLayout('Identity Gateway', content, 'sqli'));
});

// ======================================================
// MISSION 05 — INTENTIONALLY VULNERABLE SQL INJECTION
// Keep the SQL query on ONE LINE: the SQL comment challenge
// relies on the remainder of the query being on that line.
// ======================================================
app.post('/auth', (req, res) => {
  const { username, password } = req.body;

  // Deliberately vulnerable for the isolated educational CTF.
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, row) => {
    let content = '';

    if (err) {
      content = `
      <section class="panel" style="max-width:650px;margin:35px auto">
        <div class="eyebrow" style="color:#f17d82">DATABASE EXCEPTION</div>
        <h1 style="color:#f17d82">QUERY PROCESSING ERROR</h1>
        <p>El servicio IAM no pudo procesar la solicitud. Revisa qué tipo de entrada enviaste y cómo pudo afectar la consulta.</p>
        <a class="action-link" href="/auth">← RETRY AUTHENTICATION</a>
      </section>`;
    } else if (row) {
      if (row.role === 'admin') {
        const adminFlag = generateDynamicFlag('SQL_INJECTION', 'secret_salt_admin_db');
        content = `
        <section class="panel" style="max-width:680px;margin:35px auto;text-align:center">
          <div class="status-chip">● PRIVILEGED ACCESS GRANTED</div>
          <h1 style="margin-top:22px;color:#57d6ad">ADMINISTRATOR ACCESS CONFIRMED</h1>
          <p>Elevated access has been granted to the current operator.</p>
          <p>Administrator challenge flag:</p>
          <div class="flag-box">${adminFlag}</div>
          <div style="margin-top:22px"><a class="action-link" href="/">← RETURN TO COMMAND</a></div>
        </section>`;
      } else {
        const userFlag = generateDynamicFlag('NORMAL_USER', 'secret_salt_dev_db');
        content = `
        <section class="panel" style="max-width:720px;margin:35px auto;text-align:center">
          <div class="status-chip">● AUTHENTICATION SUCCESSFUL</div>
          <h1 style="margin-top:22px;color:#57d6ad">OPERATOR VERIFIED</h1>
          <p>Operator: <strong>${row.username}</strong> · Role: ${row.role}</p>
          <p>Session challenge flag:</p>
          <div class="flag-box">${userFlag}</div>
          <section class="panel" style="margin-top:18px;text-align:left;box-shadow:none">
            <div class="panel-head"><h2>IDENTITY PROFILE SERVICE</h2><span class="panel-tag">API ACCESS</span></div>
            <p>Operator profile services are available through the internal identity API.</p>
            <a class="action-link" href="/api/v1/user?id=${row.id}">INSPECT OPERATOR PROFILE →</a>
          </section>
          <a class="action-link" href="/">← RETURN TO COMMAND</a>
        </section>`;
      }
    } else {
      content = `
      <section class="panel" style="max-width:520px;margin:35px auto;text-align:center">
        <div class="eyebrow" style="color:#f17d82">IAM RESPONSE</div>
        <h1 style="color:#f17d82">ACCESS DENIED</h1>
        <p>The supplied credentials could not be validated by the IAM service.</p>
        <a class="action-link" href="/auth">← RETRY AUTHENTICATION</a>
      </section>`;
    }

    res.send(renderLayout('Authentication Result', content, 'sqli'));
  });
});

// ======================================================

// Guided mission page for the intentionally vulnerable profile API.
app.get('/identity-records', (req, res) => {
  const content = `
  <div class="page-heading">
    <div><div class="eyebrow">MISSION 04 · IDENTITY RECORDS</div><h1>IDENTITY ACCESS REVIEW</h1><p>Auditoría de autorización a nivel de objeto · Internal personnel API</p></div>
    <div class="status-chip">API SERVICE AVAILABLE</div>
  </div>
  <section class="panel">
    <div class="panel-head"><h2>PERSONNEL RECORD INDEX</h2><span class="panel-tag">TRAINING DATASET</span></div>
    <p style="color:#9bb2c6;font-size:11px;line-height:1.7">El índice contiene referencias de registros. Un identificador permite localizar un objeto, pero no debería conceder permisos por sí mismo.</p>
    <div class="directory-grid">
      <div class="directory-entry"><span class="avatar">02</span><div><strong>Security Analyst</strong><small>RECORD ID: 2 · STANDARD USER</small><div style="margin-top:8px"><a class="action-link" href="/api/v1/user?id=2" target="_blank" rel="noopener">VIEW PROFILE RECORD →</a></div></div></div>
      <div class="directory-entry"><span class="avatar">01</span><div><strong>System Administrator</strong><small>RECORD ID: 1 · PRIVILEGED ROLE</small><div style="margin-top:8px;color:#7892a9;font-size:9px">RESTRICTED PROFILE</div></div></div>
    </div>
  </section>
  <section class="panel" style="margin-top:14px">
    <div class="panel-head"><h2>ASSESSMENT OBJECTIVE</h2><span class="panel-tag">AUTHORIZATION CHECK</span></div>
    <p style="color:#9bb2c6;font-size:11px;line-height:1.7">Inspecciona el registro disponible y piensa qué debería comprobar el servidor antes de devolver información perteneciente a otro usuario. No confundas conocer un identificador con tener autorización para consultar el recurso.</p>
  </section>
  <div class="footer"><span>ORBITAL // IDENTITY SERVICES</span><span>MISSION 04</span><a href="/">← RETURN TO COMMAND</a></div>`;
  res.send(renderLayout('Identity Records', content, 'idor'));
});

// MISSION 04 — IDOR / BOLA
// Intentionally lacks object-level authorization checks.
// ======================================================
app.get('/api/v1/user', (req, res) => {
  const userId = req.query.id;

  db.get(
    `SELECT id, username, role, email, last_login FROM users WHERE id = ?`,
    [userId],
    (err, row) => {      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (row) {
        const responseData = { status: 'success', profile: row };

        if (row.username === 'admin') {
          responseData.security_authorization_flag = generateDynamicFlag(
            'IDOR_BOLA',
            'secret_salt_idor_admin'
          );
        }

        return res.json(responseData);
      }

      return res.status(404).json({ error: 'User record not found' });
    }
  );
});

// ======================================================
// BONUS 01 — X-FORWARDED-FOR TRUST ISSUE
// ======================================================
app.get('/admin-panel', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (
    clientIp &&
    (clientIp.includes('127.0.0.1') || clientIp.includes('::1'))
  ) {
    const bonus1Flag = generateDynamicFlag('BONUS_IP_SPOOF', 'secret_salt_bonus_ip');
    const content = `
    <section class="panel" style="max-width:680px;margin:35px auto;text-align:center">
      <div class="status-chip">● INTERNAL ACCESS GRANTED</div>
      <h1 style="margin-top:22px;color:#f2bd68">ROOT INFRASTRUCTURE PANEL</h1>
      <p>The network access validation has been bypassed.</p>
      <p>Infrastructure bonus flag:</p>
      <div class="flag-box">${bonus1Flag}</div>
      <div style="margin-top:22px"><a class="action-link" href="/">← RETURN TO COMMAND</a></div>
    </section>`;
    return res.send(renderLayout('Root Infrastructure', content, 'ip'));
  }

  const content = `
  <section class="panel" style="max-width:650px;margin:35px auto;text-align:center">
    <div class="eyebrow" style="color:#f2bd68">ACCESS CONTROL</div>
    <h1 style="color:#f17d82">403 // ACCESS RESTRICTED</h1>
    <p>This administrative resource is restricted to internal network connections.</p>
    <div class="notice">SECURITY POLICY :: LOCAL NETWORK REQUIRED</div>
    <div style="margin-top:20px"><a class="action-link" href="/">← RETURN TO COMMAND</a></div>
  </section>`;
  return res.status(403).send(renderLayout('Restricted Infrastructure', content, 'ip'));
});

// ======================================================

// Guided page for the API override bonus; the API response opens separately.
app.get('/api-override', (req, res) => {
  const content = `
  <div class="page-heading">
    <div><div class="eyebrow">BONUS OPERATION · API CONTROL</div><h1>API OVERRIDE REVIEW</h1><p>Auditoría de parámetros y lógica de negocio del servicio.</p></div>
    <div class="status-chip">OPTIONAL CHALLENGE</div>
  </div>
  <section class="panel">
    <div class="panel-head"><h2>SERVICE CONTROL INTERFACE</h2><span class="panel-tag">API v2</span></div>
    <p style="color:#9bb2c6;font-size:11px;line-height:1.7">El servicio de control recibe parámetros de operación. Examina cómo responde ante solicitudes incompletas y piensa qué validaciones deberían existir antes de autorizar una operación privilegiada.</p>
    <div class="notice"><strong>INVESTIGATION TASK</strong><br>Observa la respuesta JSON, identifica qué información ofrece sobre los parámetros esperados y construye una hipótesis sobre la lógica que gobierna la operación.</div>
    <div style="margin-top:18px"><a class="primary-btn" style="display:block;text-align:center" href="/api/v2/override" target="_blank" rel="noopener">INSPECT API RESPONSE →</a></div>
  </section>
  <div class="footer"><span>ORBITAL // API CONTROL</span><span>BONUS OPERATION</span><a href="/">← RETURN TO COMMAND</a></div>`;
  res.send(renderLayout('API Override Review', content, 'api'));
});

// BONUS 02 — API OVERRIDE
// ======================================================
app.get('/api/v2/override', (req, res) => {
  const action = req.query.action;
  const force = req.query.force;

  if (action === 'bypass' && force === 'true') {
    const bonus2Flag = generateDynamicFlag('BONUS_API_OVERRIDE', 'secret_salt_bonus_api');
    return res.json({
      status: 'success',
      message: 'Privilege override authorized through debugging parameter.',
      bonus_flag: bonus2Flag
    });
  }

  return res.status(400).json({
    error: 'Invalid or missing override arguments',
    hint: 'Required query parameters are missing or invalid.'
  });
});

// ======================================================
// 404
// ======================================================
app.use((req, res) => {
  const content = `
  <section class="panel" style="max-width:650px;margin:45px auto;text-align:center;padding:45px">
    <div class="eyebrow" style="color:#f17d82">NAVIGATION ERROR</div>
    <h1 style="font-size:48px;color:#f17d82;margin:10px 0">404</h1>
    <h2>RESOURCE NOT FOUND</h2>
    <p>The requested resource is not available in the current training infrastructure.</p>
    <a class="action-link" href="/">← RETURN TO COMMAND</a>
  </section>`;
  res.status(404).send(renderLayout('Resource Not Found', content, 'general'));
});

// ======================================================
// SERVER
// ======================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('================================================');
  console.log('          ORBITAL // SPACE OPERATIONS');
  console.log('================================================');
  console.log(' Environment : ISOLATED CTF TRAINING');
  console.log(' Version     : 6.0');
  console.log(' Port        : ' + PORT);
  console.log(' Status      : ONLINE');
  console.log('================================================');
  console.log('');
});