document.addEventListener('DOMContentLoaded', function() {
    const contenedorProductos = document.getElementById('contenedorProductos');
    const montoTotalElemento = document.getElementById('montoTotal');
    const numeroTicketElemento = document.getElementById('numeroTicket');
    const totalVentasElemento = document.getElementById('totalVentas');
    const ventasEfectivoElemento = document.getElementById('ventasEfectivo');
    const ventasTransferenciaElemento = document.getElementById('ventasTransferencia');
    const selectMedioPago = document.getElementById('selectMedioPago');

    // Datos de productos con su precio y stock inicial
    const productos = [
        { id: 1, nombre: 'Completo', precio: 1500, stock: 50 },
        { id: 2, nombre: 'Salchipapa', precio: 2000, stock: 30 },
        { id: 3, nombre: 'Anticucho', precio: 3000, stock: 40 },
        { id: 4, nombre: 'Bebida', precio: 500, stock: 100 },
        { id: 5, nombre: 'Café', precio: 500, stock: 100 },
    ];

    // Inicializar el stock en localStorage si no existe
    if (!localStorage.getItem('stockProductos')) {
        const stockInicial = productos.reduce((acc, producto) => {
            acc[producto.id] = producto.stock;
            return acc;
        }, {});
        localStorage.setItem('stockProductos', JSON.stringify(stockInicial));
    }

    // Recuperar datos de localStorage
    let stockProductos = JSON.parse(localStorage.getItem('stockProductos')) || {};
    let numeroTicket = parseInt(localStorage.getItem('numeroTicket')) || 1;
    let ventasEfectivo = parseFloat(localStorage.getItem('ventasEfectivo')) || 0;
    let ventasTransferencia = parseFloat(localStorage.getItem('ventasTransferencia')) || 0;
    let totalVentas = parseFloat(localStorage.getItem('totalVentas')) || 0;

    numeroTicketElemento.textContent = numeroTicket;
    ventasEfectivoElemento.textContent = ventasEfectivo.toFixed(2);
    ventasTransferenciaElemento.textContent = ventasTransferencia.toFixed(2);
    totalVentasElemento.textContent = totalVentas.toFixed(2);

    let montoTotal = 0;

    function actualizarTotalProducto(productoDiv) {
        const select = productoDiv.querySelector('.selectProducto');
        const cantidadInput = productoDiv.querySelector('.inputCantidad');
        const totalElemento = productoDiv.querySelector('.totalProducto');
        
        const productoId = parseInt(select.value);
        const precio = parseFloat(select.selectedOptions[0].getAttribute('data-precio'));
        const cantidad = Math.min(parseInt(cantidadInput.value), stockProductos[productoId]);

        if (cantidadInput.value > stockProductos[productoId]) {
            alert(`No hay suficiente stock para ${select.selectedOptions[0].textContent}. Stock disponible: ${stockProductos[productoId]}`);
        }

        cantidadInput.value = cantidad; // Asegura que el input muestre la cantidad ajustada
        const totalProducto = precio * cantidad;
        totalElemento.textContent = `Total: $${totalProducto.toFixed(2)}`;
        
        actualizarMontoTotal();
    }

    function actualizarMontoTotal() {
        montoTotal = 0;
        const productoDivs = contenedorProductos.querySelectorAll('.producto');
        productoDivs.forEach(div => {
            const select = div.querySelector('.selectProducto');
            const cantidadInput = div.querySelector('.inputCantidad');
            const precio = parseFloat(select.selectedOptions[0].getAttribute('data-precio'));
            const cantidad = parseInt(cantidadInput.value);
            montoTotal += precio * cantidad;
        });
        montoTotalElemento.textContent = montoTotal.toFixed(2);
    }

    function actualizarDesgloseVentas() {
        if (selectMedioPago.value === 'efectivo') {
            ventasEfectivo += montoTotal;
        } else if (selectMedioPago.value === 'transferencia') {
            ventasTransferencia += montoTotal;
        }
        totalVentas += montoTotal;

        ventasEfectivoElemento.textContent = ventasEfectivo.toFixed(2);
        ventasTransferenciaElemento.textContent = ventasTransferencia.toFixed(2);
        totalVentasElemento.textContent = totalVentas.toFixed(2);

        // Guardar en localStorage
        localStorage.setItem('ventasEfectivo', ventasEfectivo.toFixed(2));
        localStorage.setItem('ventasTransferencia', ventasTransferencia.toFixed(2));
        localStorage.setItem('totalVentas', totalVentas.toFixed(2));
    }

    function actualizarStock(productoId, cantidadVendida) {
        if (stockProductos[productoId] >= cantidadVendida) {
            stockProductos[productoId] -= cantidadVendida;
            localStorage.setItem('stockProductos', JSON.stringify(stockProductos));
        }
    }

    function crearElementoProducto() {
        const nuevoProductoDiv = document.createElement('div');
        nuevoProductoDiv.classList.add('producto');
        nuevoProductoDiv.innerHTML = `
            <select class="selectProducto">
                ${productos.map(p => `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} ($${p.precio})</option>`).join('')}
            </select>
            <input type="number" class="inputCantidad" min="1" value="1">
            <span class="totalProducto">Total: $${productos[0].precio}</span>
            <button type="button" class="btnEliminar">Eliminar</button>
        `;

        return nuevoProductoDiv;
    }

    function agregarProducto() {
        const nuevoProductoDiv = crearElementoProducto();
        contenedorProductos.appendChild(nuevoProductoDiv);
        actualizarMontoTotal();

        nuevoProductoDiv.querySelector('.selectProducto').addEventListener('change', function() {
            actualizarTotalProducto(nuevoProductoDiv);
        });

        nuevoProductoDiv.querySelector('.inputCantidad').addEventListener('input', function() {
            actualizarTotalProducto(nuevoProductoDiv);
        });

        nuevoProductoDiv.querySelector('.btnEliminar').addEventListener('click', function() {
            nuevoProductoDiv.remove();
            actualizarMontoTotal();
        });
    }

    function agregarListenersExistentes() {
        document.querySelectorAll('.selectProducto').forEach(select => {
            select.addEventListener('change', function() {
                actualizarTotalProducto(select.parentElement);
            });
        });

        document.querySelectorAll('.inputCantidad').forEach(input => {
            input.addEventListener('input', function() {
                actualizarTotalProducto(input.parentElement);
            });
        });
    }

    document.getElementById('agregarProducto').addEventListener('click', agregarProducto);

    document.getElementById('formularioTicket').addEventListener('submit', function(event) {
        event.preventDefault();

        const productosVendidos = [];
        const productoDivs = contenedorProductos.querySelectorAll('.producto');
        
        let stockSuficiente = true;
        productoDivs.forEach(div => {
            const select = div.querySelector('.selectProducto');
            const cantidadInput = div.querySelector('.inputCantidad');
            const productoId = parseInt(select.value);
            const cantidad = parseInt(cantidadInput.value);

            if (cantidad > stockProductos[productoId]) {
                alert(`Stock insuficiente para ${select.selectedOptions[0].textContent}.`);
                stockSuficiente = false;
                return;
            }

            productosVendidos.push({ productoId, cantidad });
        });

        if (!stockSuficiente) return; // Evita proceder si hay problemas de stock

        productosVendidos.forEach(item => {
            actualizarStock(item.productoId, item.cantidad);
        });

        alert(`Ticket número ${numeroTicket} generado. Total de la compra: $${montoTotal.toFixed(2)}. Medio de Pago: ${selectMedioPago.value}`);

        window.print();

        numeroTicket++;
        numeroTicketElemento.textContent = numeroTicket;

        localStorage.setItem('numeroTicket', numeroTicket);

        actualizarDesgloseVentas();
    });

    agregarListenersExistentes();
});


