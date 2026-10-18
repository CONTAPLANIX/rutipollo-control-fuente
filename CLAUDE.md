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
- Kardex (dentro de Gastos): entradas = gastos con "compra de mercadería" (producto + kilos); salidas = kilos vendidos en las notas
  (kg, o cantidad si no hay kg); ajustes = tipo `ajuste` (monto 0, no afecta utilidad).
- Un solo `index.html` sin frameworks (Firebase compat 10.13 + jsPDF 2.5.1), Excel .xlsx generado sin librerías (mismo código de la app).
  Versión en `APP_VERSION` (serie `CN`). Pensada para computadora, usable en celular.
- Publicar: `python C:\Users\Jobes\JEED\herramientas\publicar.py rutipollo-control` (repo privado CONTAPLANIX/rutipollo-control-fuente,
  público CONTAPLANIX/rutipollo-control rama `publicado`). Probar antes en copia local apuntando a la demo (`notaventa-demo-cpx`),
  nunca con los datos reales. No tocar `..\rutipollo\index.html` desde aquí.
