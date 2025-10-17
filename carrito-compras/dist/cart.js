// Array para almacenar los items del carrito
let itemsCarrito = [];
/**
 * Agrega un producto al carrito
 * @param producto - Producto a agregar
 * @param cantidad - Cantidad a agregar (default: 1)
 * @returns true si se agregó correctamente, false si no hay stock
 */
export function agregarAlCarrito(producto, cantidad = 1) {
    // Verificar stock disponible
    if (producto.stock < cantidad) {
        return false;
    }
    // Buscar si el producto ya existe en el carrito
    const itemExistente = itemsCarrito.find(item => item.producto.id === producto.id);
    if (itemExistente) {
        // Verificar que no exceda el stock
        if (itemExistente.cantidad + cantidad > producto.stock) {
            return false;
        }
        itemExistente.cantidad += cantidad;
    }
    else {
        // Agregar nuevo item al carrito
        itemsCarrito.push({
            producto: producto,
            cantidad: cantidad
        });
    }
    return true;
}
/**
 * Elimina un producto del carrito
 * @param productoId - ID del producto a eliminar
 */
export function eliminarDelCarrito(productoId) {
    itemsCarrito = itemsCarrito.filter(item => item.producto.id !== productoId);
}
/**
 * Actualiza la cantidad de un producto en el carrito
 * @param productoId - ID del producto
 * @param cantidad - Nueva cantidad
 * @returns true si se actualizó correctamente, false si no hay stock
 */
export function actualizarCantidad(productoId, cantidad) {
    const item = itemsCarrito.find(item => item.producto.id === productoId);
    if (!item) {
        return false;
    }
    // Verificar que la cantidad sea válida
    if (cantidad <= 0) {
        eliminarDelCarrito(productoId);
        return true;
    }
    // Verificar stock disponible
    if (cantidad > item.producto.stock) {
        return false;
    }
    item.cantidad = cantidad;
    return true;
}
/**
 * Incrementa la cantidad de un producto en el carrito
 * @param productoId - ID del producto
 * @returns true si se incrementó, false si no hay stock
 */
export function incrementarCantidad(productoId) {
    const item = itemsCarrito.find(item => item.producto.id === productoId);
    if (!item) {
        return false;
    }
    return actualizarCantidad(productoId, item.cantidad + 1);
}
/**
 * Decrementa la cantidad de un producto en el carrito
 * @param productoId - ID del producto
 */
export function decrementarCantidad(productoId) {
    const item = itemsCarrito.find(item => item.producto.id === productoId);
    if (!item) {
        return;
    }
    if (item.cantidad === 1) {
        eliminarDelCarrito(productoId);
    }
    else {
        actualizarCantidad(productoId, item.cantidad - 1);
    }
}
/**
 * Obtiene todos los items del carrito
 * @returns Array de items del carrito
 */
export function obtenerCarrito() {
    return [...itemsCarrito]; // Retorna una copia para evitar mutaciones
}
/**
 * Calcula el subtotal de un item (precio * cantidad)
 * @param item - Item del carrito
 * @returns Subtotal del item
 */
export function calcularSubtotal(item) {
    return item.producto.precio * item.cantidad;
}
/**
 * Calcula el total del carrito
 * @returns Total del carrito
 */
export function calcularTotal() {
    return itemsCarrito.reduce((total, item) => {
        return total + calcularSubtotal(item);
    }, 0);
}
/**
 * Obtiene la cantidad total de items en el carrito
 * @returns Cantidad total de items
 */
export function obtenerCantidadTotal() {
    return itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
}
/**
 * Vacía el carrito completamente
 */
export function vaciarCarrito() {
    itemsCarrito = [];
}
/**
 * Verifica si el carrito está vacío
 * @returns true si está vacío, false si no
 */
export function carritoVacio() {
    return itemsCarrito.length === 0;
}
