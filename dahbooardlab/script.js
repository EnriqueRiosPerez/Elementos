document.addEventListener('DOMContentLoaded', () => {
    // Registrar plugins globales de Chart.js
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
        Chart.defaults.set('plugins.datalabels', { // Valores por defecto para datalabels
            color: '#FEFEFE',
            font: {
                weight: 'bold'
            },
            formatter: (value, context) => {
                if (typeof value === 'object' && value !== null) { // Para scatter/bubble
                    if (context.chart.config.type === 'bubble') return value.r; // Mostrar radio para bubble
                    return `(${value.x}, ${value.y})`; // Mostrar (x,y) para scatter
                }
                return value;
            }
        });
    } else {
        console.warn('ChartDataLabels plugin no está cargado.');
    }

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const chartTypeSelect = document.getElementById('chartType');
    const chartTitleInput = document.getElementById('chartTitle');
    const dataInputModeSelect = document.getElementById('dataInputMode');

    // Inputs Modo Simple
    const simpleDataInputsDiv = document.getElementById('simpleDataInputs');
    const chartLabelsInput = document.getElementById('chartLabels');
    const chartDataInput = document.getElementById('chartData');
    const datasetLabelInput = document.getElementById('datasetLabel');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const borderColorInput = document.getElementById('borderColor');

    // Inputs Modo Avanzado
    const advancedDataInputsDiv = document.getElementById('advancedDataInputs');
    const rawDataJsonInput = document.getElementById('rawDataJson');
    const groupByFieldInput = document.getElementById('groupByField');
    const processingFieldInput = document.getElementById('processingField');
    const advancedColorsInput = document.getElementById('advancedColors');

    // Opciones de Visualización
    const showLegendCheckbox = document.getElementById('showLegend');
    const showDataLabelsCheckbox = document.getElementById('showDataLabels');
    const beginAtZeroYCheckbox = document.getElementById('beginAtZeroY');
    const hideXGridCheckbox = document.getElementById('hideXGrid');
    const hideYGridCheckbox = document.getElementById('hideYGrid');
    
    // Botones y Contenedores
    const saveConfigButton = document.getElementById('saveConfigButton');
    const clearDashboardButton = document.getElementById('clearDashboardButton');
    const previewCtx = document.getElementById('myChartPreview').getContext('2d');
    const dashboardContainer = document.getElementById('dashboardContainer');

    let previewChartInstance;
    let savedChartConfigs = JSON.parse(localStorage.getItem('dashboardChartsV2')) || []; // V2 para evitar conflictos con versiones antiguas

    // --- FUNCIONES DE UTILIDAD ---
    function getRandomColor() {
        const r = Math.floor(Math.random() * 200 + 25); // Evitar colores muy oscuros/claros
        const g = Math.floor(Math.random() * 200 + 25);
        const b = Math.floor(Math.random() * 200 + 25);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    }

    function getRandomBorderColor(rgbaColor) {
        return rgbaColor.replace(/[^,]+(?=\))/, '1'); // Cambia alfa a 1
    }
    
    function parseScatterBubbleData(dataString) {
        // Espera formato como (1,5),(2,8) o {x:1,y:5},{x:2,y:8} para bubble con radio: {x:1,y:5,r:10}
        // Esto es una simplificación, podría necesitar validación más robusta
        try {
            if (dataString.trim().startsWith('{')) { // Asume objetos JSON separados por coma
                 return JSON.parse(`[${dataString}]`);
            }
            // Para formato (x,y)
            return dataString.split('),(')
                .map(pair => {
                    const values = pair.replace(/[()]/g, '').split(',');
                    if (values.length === 2) return { x: parseFloat(values[0]), y: parseFloat(values[1]) };
                    if (values.length === 3) return { x: parseFloat(values[0]), y: parseFloat(values[1]), r: parseFloat(values[2]) }; // Para bubble
                    return null;
                })
                .filter(v => v !== null && !isNaN(v.x) && !isNaN(v.y) && (v.r === undefined || !isNaN(v.r)));
        } catch (e) {
            console.error("Error parseando datos scatter/bubble:", e);
            return [];
        }
    }


    // --- SIMULACIÓN DE LÓGICA DE PROCESAMIENTO DE DATOS AVANZADA ---
    // Estas funciones deben ser reemplazadas por tu lógica real.
    async function Chart_StructureData_Lab(db, groupBy) {
        console.log("Lab: Chart_StructureData_Lab llamada con:", db, groupBy);
        if (!db || !Array.isArray(db) || db.length === 0 || !groupBy) return { keys: [], Values: [] };
        const counts = db.reduce((acc, item) => {
            const key = item[groupBy] !== undefined ? String(item[groupBy]) : "Desconocido";
            acc[key] = (acc[key] || 0) + (parseFloat(item.Value) || 1);
            return acc;
        }, {});
        return { keys: Object.keys(counts), Values: Object.values(counts) };
    }

    async function processBuildingStatus_Lab(db, field, groupBy, colors) {
        console.log("Lab: processBuildingStatus_Lab llamada con:", db, field, groupBy, colors);
        if (!db || !Array.isArray(db) || db.length === 0 || !groupBy) return { labels: [], datasets: [] };
        const structured = await Chart_StructureData_Lab(db, groupBy);
        return {
            labels: structured.keys,
            datasets: [{
                label: field ? `Datos de ${field} por ${groupBy}` : `Datos por ${groupBy}`,
                data: structured.Values,
                backgroundColor: colors && colors.length > 0 ? colors : [getRandomColor()],
                borderColor: colors && colors.length > 0 ? colors.map(c => getRandomBorderColor(c)) : [getRandomBorderColor(getRandomColor())],
                borderWidth: 1.5
            }]
        };
    }

    // --- LÓGICA PRINCIPAL ---
    async function updatePreviewChart() {
        const type = chartTypeSelect.value;
        const title = chartTitleInput.value.trim();
        let chartDataForConfig = { labels: [], datasets: [] };

        if (dataInputModeSelect.value === 'simple') {
            const labels = chartLabelsInput.value.split(',').map(s => s.trim()).filter(s => s);
            let dataValues;

            if (type === 'scatter' || type === 'bubble') {
                dataValues = parseScatterBubbleData(chartDataInput.value);
            } else {
                dataValues = chartDataInput.value.split(',').map(Number).filter(n => !isNaN(n));
            }
            
            const datasetLabelText = datasetLabelInput.value.trim() || 'Mi Dataset';
            let backgroundColorsArray = backgroundColorInput.value.split(';').map(s => s.trim()).filter(s => s);
            let borderColorsArray = borderColorInput.value.split(';').map(s => s.trim()).filter(s => s);

            if (type === 'pie' || type === 'doughnut' || type === 'polarArea' || type === 'bar' || type === 'bubble') {
                while (backgroundColorsArray.length < dataValues.length) {
                    const newColor = getRandomColor();
                    backgroundColorsArray.push(newColor);
                    if (borderColorsArray.length < dataValues.length) borderColorsArray.push(getRandomBorderColor(newColor));
                }
            } else { // line, radar, scatter
                if (backgroundColorsArray.length === 0 && dataValues.length > 0) backgroundColorsArray.push(getRandomColor());
                if (borderColorsArray.length === 0 && dataValues.length > 0) borderColorsArray.push(getRandomBorderColor(backgroundColorsArray[0] || getRandomColor()));
            }
            
            chartDataForConfig = {
                labels: labels, // Para scatter/bubble, los labels pueden no ser usados directamente si los datos son objetos {x,y}
                datasets: [{
                    label: datasetLabelText,
                    data: dataValues,
                    backgroundColor: backgroundColorsArray,
                    borderColor: borderColorsArray,
                    borderWidth: 1.5,
                    fill: type === 'line' ? false : (type === 'radar' ? true : undefined), // Undefined para default de Chart.js
                    pointRadius: type === 'line' || type === 'radar' ? 4 : undefined,
                    pointBackgroundColor: borderColorsArray[0] || '#fff',
                }]
            };
             // Para scatter y bubble, si no hay labels explícitos y los datos son {x,y}, Chart.js no usa `data.labels`
            if ((type === 'scatter' || type === 'bubble') && dataValues.every(d => typeof d === 'object' && d.x !== undefined && d.y !== undefined)) {
                delete chartDataForConfig.labels; // Dejar que Chart.js maneje las escalas numéricas
            }


        } else { // Modo 'advanced'
            let db;
            try {
                db = JSON.parse(rawDataJsonInput.value.trim() || '[]');
                if (!Array.isArray(db)) throw new Error("El JSON de datos crudos debe ser un array.");
            } catch (e) {
                alert(`Error en el JSON de datos crudos: ${e.message}`);
                if (previewChartInstance) previewChartInstance.destroy(); previewChartInstance = null;
                return null; // Retornar null para indicar fallo
            }
            const groupBy = groupByFieldInput.value.trim();
            const field = processingFieldInput.value.trim() || undefined;
            const colors = advancedColorsInput.value.split(',').map(s => s.trim()).filter(s => s);

            if (!groupBy) {
                alert("El campo 'Agrupar por (groupBy)' es obligatorio en modo avanzado.");
                if (previewChartInstance) previewChartInstance.destroy(); previewChartInstance = null;
                return null;
            }

            if (field) {
                chartDataForConfig = await processBuildingStatus_Lab(db, field, groupBy, colors);
            } else {
                const structuredData = await Chart_StructureData_Lab(db, groupBy);
                chartDataForConfig = {
                    labels: structuredData.keys,
                    datasets: [{
                        label: `Datos por ${groupBy}`,
                        data: structuredData.Values,
                        backgroundColor: colors.length > 0 ? colors : [getRandomColor()],
                        borderColor: colors.length > 0 ? colors.map(c => getRandomBorderColor(c)) : [getRandomBorderColor(getRandomColor())],
                        borderWidth: 1.5
                    }]
                };
            }
        }

        const chartConfig = {
            type: type,
            data: chartDataForConfig,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                layout: { padding: { top: (title ? 30 : 10), right:10, bottom:10, left:10 } },
                onClick: (event, elements) => {
                    if (!previewChartInstance || elements.length === 0) return;
                    const { datasetIndex, index } = elements[0];
                    const clickedLabel = previewChartInstance.data.labels ? previewChartInstance.data.labels[index] : `Punto ${index}`;
                    const clickedValue = previewChartInstance.data.datasets[datasetIndex].data[index];
                    const datasetClickedLabel = previewChartInstance.data.datasets[datasetIndex].label;
                    console.log(`Clic en: Label "${clickedLabel}", Valor:`, clickedValue, `, Dataset "${datasetClickedLabel}"`);
                },
                scales: (type !== 'pie' && type !== 'doughnut' && type !== 'polarArea') ? {
                    x: { 
                        grid: { display: !hideXGridCheckbox.checked },
                        title: { display: (type === 'scatter' || type === 'bubble'), text: 'Eje X' } // Título de eje para scatter/bubble
                    },
                    y: { 
                        grid: { display: !hideYGridCheckbox.checked }, 
                        beginAtZero: beginAtZeroYCheckbox.checked,
                        title: { display: (type === 'scatter' || type === 'bubble'), text: 'Eje Y' }
                    }
                } : {},
                plugins: {
                    title: {
                        display: !!title,
                        text: title,
                        padding: { top: 10, bottom: 20 },
                        font: { size: 18, weight: 'bold' }
                    },
                    legend: {
                        display: showLegendCheckbox.checked,
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index', // 'index' o 'point' o 'nearest'
                        intersect: false, // Para que tooltip aparezca al pasar cerca, no solo encima
                    },
                    datalabels: { // Configuración para chartjs-plugin-datalabels
                        display: showDataLabelsCheckbox.checked,
                        // Otros defaults ya están en Chart.defaults.set
                    }
                }
            }
        };
        
        // Limpiar gráfica anterior si existe
        if (previewChartInstance) {
            previewChartInstance.destroy();
            previewChartInstance = null;
        }

        // Crear nueva gráfica si hay datos y configuración
        if (previewCtx && chartConfig.data && chartConfig.data.datasets && chartConfig.data.datasets.length > 0 && 
            (chartConfig.data.labels && chartConfig.data.labels.length > 0 || chartConfig.data.datasets[0].data.length > 0) ) {
            try {
                previewChartInstance = new Chart(previewCtx, chartConfig);
            } catch (e) {
                console.error("Error creando la gráfica:", e, JSON.stringify(chartConfig, null, 2));
                alert("Error al crear la gráfica: " + e.message + ". Revisa la consola para más detalles.");
                return null;
            }
        } else {
            // console.warn("No se pudo crear la gráfica, faltan datos o configuración.", chartConfig);
            // Si no hay datos, es normal, no mostrar error, solo limpiar.
        }
        return chartConfig;
    }

    async function saveCurrentChartConfig() {
        const currentFullConfig = await updatePreviewChart();
        if (!currentFullConfig || !currentFullConfig.data || !currentFullConfig.data.datasets || currentFullConfig.data.datasets.length === 0 ||
            currentFullConfig.data.datasets[0].data.length === 0) {
            alert("Por favor, asegúrate de que la gráfica tenga datos válidos antes de guardar.");
            return;
        }
        
        const configToSave = {
            chartJsConfig: currentFullConfig, // La configuración que Chart.js usa directamente
            labSettings: { // Guardar el estado de la UI para posible "edición" futura
                chartType: chartTypeSelect.value,
                chartTitle: chartTitleInput.value,
                dataInputMode: dataInputModeSelect.value,
                showLegend: showLegendCheckbox.checked,
                showDataLabels: showDataLabelsCheckbox.checked,
                beginAtZeroY: beginAtZeroYCheckbox.checked,
                hideXGrid: hideXGridCheckbox.checked,
                hideYGrid: hideYGridCheckbox.checked,
            }
        };

        if (dataInputModeSelect.value === 'simple') {
            configToSave.labSettings.simple = {
                labels: chartLabelsInput.value,
                data: chartDataInput.value,
                datasetLabel: datasetLabelInput.value,
                backgroundColor: backgroundColorInput.value,
                borderColor: borderColorInput.value,
            };
        } else {
            configToSave.labSettings.advanced = {
                rawDataJson: rawDataJsonInput.value,
                groupByField: groupByFieldInput.value,
                processingField: processingFieldInput.value,
                advancedColors: advancedColorsInput.value,
            };
        }

        savedChartConfigs.push(configToSave);
        localStorage.setItem('dashboardChartsV2', JSON.stringify(savedChartConfigs));
        alert('¡Configuración guardada en el Dashboard!');
        renderDashboard();
    }

    function renderDashboard() {
        dashboardContainer.innerHTML = '';
        savedChartConfigs.forEach((savedEntry, index) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.classList.add('chart-container-dashboard');
            
            const canvas = document.createElement('canvas');
            canvas.id = `dashboardChart-${Date.now()}-${index}`; // ID más único
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = () => deleteChartFromDashboard(index);

            chartWrapper.appendChild(canvas); // Añadir canvas primero
            chartWrapper.appendChild(deleteButton); // Luego el botón
            dashboardContainer.appendChild(chartWrapper);

            try {
                new Chart(canvas.getContext('2d'), savedEntry.chartJsConfig);
            } catch(e) {
                console.error("Error renderizando gráfica guardada:", e, savedEntry.chartJsConfig);
                chartWrapper.innerHTML = `<p style="color:red;">Error al cargar esta gráfica. Configuración corrupta o inválida.</p>`;
            }
        });
    }

    function deleteChartFromDashboard(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta gráfica del dashboard?')) {
            savedChartConfigs.splice(index, 1);
            localStorage.setItem('dashboardChartsV2', JSON.stringify(savedChartConfigs));
            renderDashboard();
        }
    }
    
    function clearDashboard() {
        if (confirm('¿Estás seguro de que quieres limpiar TODO el dashboard? Esta acción no se puede deshacer.')) {
            savedChartConfigs = [];
            localStorage.removeItem('dashboardChartsV2');
            renderDashboard();
            alert('Dashboard limpiado.');
        }
    }

    // --- EVENT LISTENERS ---
    const allConfigInputs = [
        chartTypeSelect, chartTitleInput, dataInputModeSelect,
        chartLabelsInput, chartDataInput, datasetLabelInput, backgroundColorInput, borderColorInput,
        rawDataJsonInput, groupByFieldInput, processingFieldInput, advancedColorsInput,
        showLegendCheckbox, showDataLabelsCheckbox, beginAtZeroYCheckbox, hideXGridCheckbox, hideYGridCheckbox
    ];

    allConfigInputs.forEach(input => {
        input.addEventListener('input', updatePreviewChart); // Actualiza en 'input' para la mayoría
        if (input.type === 'select-one' || input.type === 'checkbox') { // 'change' para select y checkbox
             input.addEventListener('change', updatePreviewChart);
        }
    });

    dataInputModeSelect.addEventListener('change', () => {
        const isSimpleMode = dataInputModeSelect.value === 'simple';
        simpleDataInputsDiv.style.display = isSimpleMode ? 'block' : 'none';
        advancedDataInputsDiv.style.display = isSimpleMode ? 'none' : 'block';
        updatePreviewChart(); // Actualizar al cambiar de modo
    });
    
    saveConfigButton.addEventListener('click', saveCurrentChartConfig);
    clearDashboardButton.addEventListener('click', clearDashboard);

    // --- INICIALIZACIÓN ---
    dataInputModeSelect.dispatchEvent(new Event('change')); // Para setear visibilidad inicial de divs de datos
    renderDashboard(); // Cargar y mostrar gráficas guardadas
    updatePreviewChart(); // Mostrar una vista previa inicial
});