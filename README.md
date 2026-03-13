# Excel Dashboard

Un dashboard interactivo para visualizar y analizar datos de archivos Excel con una interfaz moderna y responsiva.

## 🚀 Características

- **Carga de archivos Excel**: Soporta archivos .xlsx y .xls
- **Visualización de datos**: Tablas interactivas con paginación
- **Filtros dinámicos**: Filtra datos por columna en tiempo real
- **Exportación**: Exporta datos filtrados a nuevos archivos Excel
- **Interfaz moderna**: Diseño responsivo con Tailwind CSS
- **Sin dependencias de backend**: Procesamiento completo en el navegador

## 📋 Requisitos

- Node.js (versión 16 o superior)
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/jorgeale90/excel-dashboard.git
cd excel-dashboard
```

2. Instala las dependencias:
```bash
npm install
```

## 🏃‍♂️ Ejecución

### Modo desarrollo
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:5173`

### Modo producción
```bash
npm run build
npm run preview
```

## 📖 Uso

1. **Cargar un archivo Excel**: 
   - Haz clic en el botón "Seleccionar archivo Excel"
   - O arrastra y suelta un archivo en el área indicada

2. **Visualizar datos**:
   - Los datos se mostrarán en una tabla paginada
   - Usa los controles de paginación para navegar

3. **Filtrar datos**:
   - Usa las casillas de filtro debajo de cada encabezado de columna
   - Los filtros se aplican automáticamente mientras escribes

4. **Exportar datos**:
   - Después de filtrar, haz clic en "Exportar a Excel"
   - Se descargará un nuevo archivo con solo los datos filtrados

## 🏗️ Estructura del proyecto

```
excel-dashboard/
├── src/
│   ├── components/
│   │   ├── ExcelUploader.vue    # Componente para cargar archivos
│   │   ├── DataTable.vue        # Tabla de datos con filtros
│   │   └── ExportButton.vue     # Botón de exportación
│   ├── composables/
│   │   └── useExcel.js          # Lógica para manejar archivos Excel
│   ├── utils/
│   │   └── excelUtils.js        # Utilidades para procesamiento
│   ├── App.vue                  # Componente principal
│   └── main.js                  # Punto de entrada
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 📦 Dependencias principales

- **Vue 3**: Framework JavaScript progresivo
- **Vue Router**: Manejo de rutas
- **XLSX**: Librería para procesar archivos Excel
- **Tailwind CSS**: Framework de CSS utilitario
- **Vite**: Herramienta de construcción y desarrollo

## 🎨 Personalización

### Cambiar colores
Edita `tailwind.config.js` para modificar la paleta de colores:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#tu-color',
      // ...
    }
  }
}
```

### Agregar nuevas funcionalidades
1. Crea nuevos componentes en `src/components/`
2. Importa y úsalos en `App.vue`
3. Agrega la lógica correspondiente en los composables

## 🐛 Solución de problemas

### Problemas comunes

**Error al cargar archivo Excel**
- Verifica que el archivo tenga el formato correcto (.xlsx o .xls)
- Asegúrate de que el archivo no esté dañado

**Filtros no funcionan**
- Los filtros son sensibles a mayúsculas y minúsculas
- Verifica que haya datos en la columna que estás filtrando

**Exportación fallida**
- Asegúrate de haber cargado datos antes de exportar
- Verifica que tu navegador permita descargas

## 🤝 Contribuir

1. Fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de los cambios (`git commit -m 'Agregando nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Jorge Alejandro**
- GitHub: [@jorgeale90](https://github.com/jorgeale90)

## 🙏 Agradecimientos

- [Vue.js](https://vuejs.org/) - El framework web progresivo
- [SheetJS](https://sheetjs.com/) - Librería para procesamiento de hojas de cálculo
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS utilitario
