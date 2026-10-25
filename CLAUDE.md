# Rutipollo Control — página de control interno (solo Rutipollo)

- Enlace: https://contaplanix.github.io/rutipollo-control/ · misma base Firebase `rutipollo-ventas` que la app Rutipollo.
- Fórmula central: INGRESOS − EGRESOS = UTILIDAD. Ingresos = notas de la app (vendido y cobrado: efectivo, banco, Yape, Plin y
  cobros de deudas por fecha de cobro). Egresos = gastos registrados a mano aquí (colección `egresos`).
- Entran solo administradoras (ELLIAN, DELIA, y el dueño si tiene usuario admin): nombre + contraseña de la app, sin PIN.
  Se comprueba `usuarios/{uid}.rol == "admin"`; los vendedores no entran.
- Colecciones propias (reglas solo admin en `..\herramientas\rutipollo-setup\firestore.rules`):
  `egresos/{id}` {tipo gasto|ajuste, fecha, anio, mes, dia, categoria, descripcion, monto, metodo, kardex{producto,kg}|null,
  foto (dataURL jpeg comprimido)|null, registradoPor, creadoEn, eliminado (papelera, nunca se borra)},
  `cierres/{fecha}` {esperado, real, diferencia, nota, por}, `control/config` {categorias[]}.
- Kardex: entradas = gastos con "compra de mercadería" (producto + kilos); salidas = kilos vendidos en las notas (kg, o cantidad si no
  hay kg); ajustes = tipo `ajuste` y mermas = tipo `merma` (ambos monto 0, no afectan la utilidad; la merma muestra pérdida estimada = kg × costo promedio).
- "Tienda en vivo": escena isométrica del local dibujada en canvas (sin librerías): cada nota real de HOY entra como un cliente que compra y paga
  en caja (monedas), las compras con kardex llegan en camión, las mermas salen de la cámara, las motos llevan el nombre de cada usuario y
  salen "en ruta" cuando ese vendedor emite una nota; día/noche según la hora. Al costado, los números del día y las últimas notas.
  La escena no se reconstruye en cada actualización: `render()` solo refresca el panel (`vivoRefrescar`) mientras se está en esa vista.
- C8 (18-oct-2026): gráficos con la skill dataviz (columnas finas azul/naranja validadas para daltónicos, grilla, leyenda, tooltip; barra apilada
  de formas de pago; mini tendencias de 14 días), avisos (caja descuadrada, cliente con deuda, stock bajo; límites en `control/config.alertas`),
  metas del mes (`control/config.metas`), ranking de clientes y productos (margen con costo del Kardex), sonido + voz en Rico Pollo en vivo
  (botón, se guarda en localStorage) e instalación como app (`sw.js`: index siempre de red, resto en caché).
- C9/C10 (18-oct-2026): pestaña Avisos propia; iconos SVG de línea (`ICONOS`/`ico()`), animación de columnas y conteo de números al
  cambiar de vista o periodo, botón claro/oscuro (`data-theme`, guardado en localStorage), mapa de ventas con Leaflet 1.9.4 (cdnjs + teselas
  de OpenStreetMap; puntos por nota con `ubicacion`), calendario de calor del mes (SVG), línea de utilidad acumulada en el gráfico, gráficos
  dentro del PDF (SVG → JPEG) y modo TV en Rico Pollo en vivo (`body.tv` + pantalla completa).
- C11/C12 (18-oct-2026): modo oscuro con variables propias (`--band`, `--sel`, `body.oscuro`); cabecera solo "RICO POLLO". Escena en vivo: cámara que
  sigue al cliente (`CAM`), celebraciones (`celebrar()`: meta del día = meta mensual / días del mes, venta más grande del día, cada S/ 1,000),
  marcador de vendedores en la pared (`VIVO.marcador`), cielo real por hora (`CIELO_CLAVES`, sol/luna/nubes/estrellas).
- C13: los vendedores usan CAMIÓN (no moto): `dibujarMoto` dibuja un camión de reparto con el nombre; vitrina a la izquierda con hasta 5
  productos reales (`tipoProducto` elige el dibujo por palabra clave: pollo, pechuga, pierna, alita, huevo, menudencia) y kilos vendidos hoy.
- C14/C15: campanita de caja y voz natural (`mejorVoz`); foto del comprobante con recorte (`abrirRecorte`, canvas con rectángulo) y lectura del
  monto con Tesseract.js 5.1.1 (cdnjs, carga diferida al tocar "Leer monto", idioma `spa`, datos desde tessdata.projectnaptha.com);
  `interpretarTexto` prioriza cifras en líneas con TOTAL/IMPORTE/S/ y excluye SUBTOTAL/IGV; también saca fecha y proveedor.
- C16–C18: vista 3D real con three.js 0.160 (cdnjs, carga diferida al entrar a Rico Pollo en vivo; botón "Vista: 3D / clásica", guardado
  en localStorage `vista3d`). La lógica (clientes, cola, camión, celebraciones, marcador) es la misma; solo cambia el dibujo: `vivo3dInit`
  construye la escena sobre `#vivo-gl`, `vivo3dRender` la actualiza; el canvas 2D queda oculto como respaldo. Roles: UN solo camión de
  reparto (ventas de usuarios con rol vendedor, p. ej. CRISTIAN, se atienden en la vereda junto al camión); los administradores (JABES,
  DELIA, ELLIAN) son cajeros detrás del mostrador (`vivoCajeros`, lee `usuarios`). Otto: perrito blanco que pasea (`OTTO`, `moverOtto`).
- C22/C23: realismo 3D según las skills `threejs-lighting` y `threejs-materials` (skills.sh, repo cloudai-x/threejs-skills): entorno
  reflejado con PMREM (`crearEntorno`), luces en candela (PointLight 14 de noche / 2 de día; SpotLight del camión 35), sombra del sol con
  radius/bias, `MeshPhysicalMaterial` con clearcoat (camión, mostrador) y transmission (vitrina), sombras de contacto (`sombraContacto`).
  Mascotas: `MASCOTAS` (Otto, Ramón, Duko) con `moverMascota`/`dibujarMascota`/`vivo3dMascota`. La carpeta `capturas/` no se sube.
- C25: "Importar SIRE / honorarios" en Gastos: lee .xlsx (zip + DecompressionStream, sin librerías), .csv/.txt (separador autodetectado),
  detecta columnas por título (fecha, serie/número, RUC y nombre del proveedor evitando las de la propia empresa, total, moneda/TC),
  sugiere categoría (`categoriaSugerida`), marca duplicados por RUC+comprobante o fecha+monto, guarda egresos con `origen:"importado"`,
  `comprobante`, `proveedor{ruc,razonSocial}`. Gastos fijos del mes: `control/config.recurrentes[]`, se registran con `recurrenteId`.
- C26 (24-oct-2026): pestaña **Tinas** (colección `tinas/{id}` {tipo salida|entrada, cliente, cantidad, fecha, anio, mes, dia, nota, registradoPor,
  creadoEn, eliminado}; saldo por cliente, "desde" = fecha en que el saldo dejó de ser 0; total de tinas en `control/config.tinas.total`; aviso
  `tinasDias` en `alertas`). Merma al recibir la compra (campo en Registrar gasto con Kardex: crea un egreso `merma` con `compraId`).
  Mayoristas con tope de crédito (`control/config.mayoristas[] {id, cliente, tope}`): alarma roja fija arriba de toda la página (`alarmaHtml`)
  y avisos tipo `tope` (al 80 % "cerca"). Gastos fijos con cuotas (`recurrentes[].cuotas`; el egreso lleva `cuota` y la descripción "cuota k de N";
  deja de pedirse al completar). Trabajadores con sueldo (`control/config.trabajadores[] {id, nombre, sueldo, dia, metodo}`) → cada mes salen en
  Gastos como "Sueldo · NOMBRE" (`origen:"planilla"`, `trabajador`). Categorías nuevas que se agregan solas: "Embutidos y cremas", "Cuotas del local",
  "Servicios básicos del local" (`CATEGORIAS_NUEVAS`). Escena: DOS camiones (`REPARTO 1` y `REPARTO 2`, `chofer` según Ruta de hoy, `camionDe`),
  almacén de embutidos y cremas (3D `vivo3dAlmacenCrear`, productos que cumplen `RE_ALMACEN`), y **zonas clicables** estilo centro de convenciones
  virtual (`ZONAS`, `vivo3dZonasCrear` con Raycaster, brillo al pasar el mouse, borde rojo pulsante si la zona tiene aviso, tarjeta `#vivo-zona-card`
  con `zonaInfoHtml`, barra de iconos `vivoZonasBarHtml`, podio de vendedores `podioHtml`). Reglas: `tinas` solo admin (demo desplegada;
  rutipollo-ventas pendiente si no se desplegó). Respaldo diario incluye `tinas`.
- C27 (24-oct-2026): pestaña **Mercaderías** (`calcCompras`, `renderMercaderias`, `proveedorDe`): todas las compras con Kardex por fecha,
  por producto y por proveedor, filtro `UI.mercProd` y buscador `UI.mercBuscar`; en el celular la pestaña se llama "Compras" (5.º elemento de `navs`).
  Arreglos tras revisión: la merma "al recibir" (`compraId`) se edita/elimina/restaura junto con su compra (`mermasDeCompra`); la migración
  de categorías corre una sola vez (`control/config.catsV = 26`); el camión 2 vuelve hasta su sitio; `guardarRutaHoy` actualiza el botón de la barra.
- C28 (25-oct-2026): Excel/PDF incluyen Mercaderías y Tinas (`datosExport.compras/tinas`); alarma de tope de crédito en la escena
  (`VIVO.topeAnt`, evento `alarma`, `sonar("alarma")`, solo si la escena lleva >15 s montada); cobranza por WhatsApp (`mensajeCobranza`,
  `waUrl`, `abrirWaCobrar`, botón `wa-cobrar` en avisos de deuda/tope y en el banner; `mayoristas[].telefono` opcional); resumen por
  WhatsApp (`resumenDiaTexto`, `abrirResumenWa`; en Tablero usa el periodo, en En vivo el día; a las 20:00 se abre solo una vez al día,
  `lsGet("resumenWa")`); avisos `margen` (`ventasBajoCosto`: precio de hoy < costo promedio del mes); caja por billetes y monedas
  (`DENOMINACIONES`, `UI.cajaConteo`, se guarda en `cierres.conteo`); tutorial guiado (`TUTORIAL`, `#tut-card`, `lsGet("tutorialVisto")`,
  botón en Ajustes); Ruta de hoy elige camión por persona (`rutaHoy.camiones {NOMBRE_NORMALIZADO: 0|1}`, `camionesHoy`).
- C29 (25-oct-2026): zonas `camion1` y `camion2` separadas (una por camión, `ZONAS[].camion` = índice en `VIVO.motos`); la tarjeta muestra chofer y ventas en ruta de ese chofer.
- C30 (25-oct-2026): paradas del día por camión (`ventasCamion(ci)`: notas en ruta de los choferes de ese camión, en orden de hora) con
  dirección aproximada por GPS (`direccionDe` → Nominatim reverse, cola de 1 pedido/1,1 s, caché `lrc_geo` en localStorage, `direccionCorta`),
  `paradasHtml`, `cargarDirecciones` (rellena `[data-geo]`), y "Ver recorrido en el mapa" (`abrirRecorrido`: Leaflet con marcadores numerados y línea).
- C31 (25-oct-2026): cierre del día animado (`cerrarDia`/`reabrirDia`, botón "Cerrar el día" en la barra y automático a las 20:00 en la vista En vivo,
  `lsGet("cierreAnim")`; letrero con totales, lluvia de monedas, cajeras a la puerta, persiana 3D `T3.persiana`, luces bajas, `VIVO.cerradoDia`).
  Las paradas usan `v.direccion` si la nota ya la trae (las apps v54/A16/D8/H5 la guardan al emitir; reglas: `direccion` permitida en `soloCobro`).
  Resumen de las 20:00 aunque la página esté cerrada: `herramientas
esumen_wa
esumen_diario.py` + tarea de Windows "JEED resumen WhatsApp"
  (CallMeBot al 918817528; falta la apikey en `config.json`).
- C32 (25-oct-2026): three.js se precarga al entrar (`cargarThree()` en `alEntrar`) y mientras carga la vista 3D se muestra `.vivo-cargando`
  en vez del dibujo 2D (el bucle no dibuja 2D en modo 3d). Camiones estacionados a los lados (`px` 1.6 y 9.6) para dejar libre la puerta
  (x 4.75); el camión del proveedor se detiene en x 6.5; vendedor de ruta en la vereda junto a la cabina (`px+2.3, z 8.45`) y el cliente de
  ruta llega por la vereda (z 8.3) desde la derecha. Las zonas `camion1/camion2` siguen a esas posiciones.
- C33 (25-oct-2026): "Recorridos por día" (botón en el mapa del Tablero, en la tarjeta del camión y en el modal del recorrido de hoy):
  `abrirRecorridos(fecha, vendedor)` → `ventasDelDia` + `pintarRecorrido` (controles `rec-fecha`/`rec-vend`, paradas con dirección, mapa).
  Los días pasados se ven por vendedor (no por camión, porque la asignación de camión solo se guarda del día). Carga el año con `cargarAnio`.
- C34 (25-oct-2026): "Recorridos" es pestaña propia del menú (`renderRecorridos`, en celular "Rutas"): día anterior/siguiente/hoy,
  vendedor, paradas con dirección y mapa (`montarRecorridoMapa`, se monta desde `render()`); se quitó el botón del Tablero.
- C35 (25-oct-2026): la persiana queda oculta (dentro de un cajón sobre la puerta) mientras el local está abierto; solo se ve al bajar.
- C36 (25-oct-2026): 10 mejoras de En vivo: repetir un día (`replayIniciar/replayPaso/replayParar`, `VIVO.replay`, barra `#replay-barra`;
  se cancela al remontar la vista), mini mapa en la tarjeta del camión (`montarMiniRuta`, `MINI`), avisos dentro de la escena
  (`VIVO.zonaAvisoTxt`, sprites `q.aviso`), meta del día en la pared izquierda (`vivo3dMeta`), clientes frecuentes con nombre y color
  (`clientesFrecuentes`), horas pico (`horasPicoHtml`, `#vivo-horas`), clima real (Open-Meteo, `CLIMA`, `climaFactor`, lluvia `vivo3dLluvia`;
  coordenadas de `control/config.local{lat,lon}` o promedio de notas con GPS), modo TV rotativo (`TV_ROTA`), murmullo de ambiente y motor
  del camión (`ambienteSonoro`, `sonar("camion")`, volumen `VIVO.volumen`/`#vivo-vol`, `asegurarMaster`), puerta de vidrio de dos hojas
  (`vivo3dPuerta`) y ventanas con transmission. Revisión: 2 fallas corregidas (murmullo al salir de la vista, replay tras remontar).
- Un solo `index.html` sin frameworks (Firebase compat 10.13 + jsPDF 2.5.1), Excel .xlsx generado sin librerías (mismo código de la app).
  Versión en `APP_VERSION` (serie `CN`). Pensada para computadora, usable en celular.
- Publicar: `python C:\Users\Jobes\JEED\herramientas\publicar.py rutipollo-control` (repo privado CONTAPLANIX/rutipollo-control-fuente,
  público CONTAPLANIX/rutipollo-control rama `publicado`). Probar antes en copia local apuntando a la demo (`notaventa-demo-cpx`),
  nunca con los datos reales. No tocar `..\rutipollo\index.html` desde aquí.
