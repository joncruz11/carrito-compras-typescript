import { Producto } from './types.js';
import { cargarProductos, buscarProductoPorId } from './data.js';
import {
  agregarAlCarrito,
  eliminarDelCarrito,
  incrementarCantidad,
  decrementarCantidad,
  obtenerCarrito,
  calcularTotal,
  calcularSubtotal,
  obtenerCantidadTotal,
  vaciarCarrito,
  carritoVacio
} from './cart.js';
import {
  inicializarAuth,
  registrarUsuario,
  loginUsuario,
  cerrarSesion,
  obtenerUsuarioActual,
  estaLogueado
} from './auth.js';

// Variables globales
let productos: Producto[] = [];
let mostrandoCarrito = false;

/**
 * Inicializa la aplicación
 */
async function inicializarApp(): Promise<void> {
  // Inicializar autenticación
  inicializarAuth();

  // Cargar productos
  productos = await cargarProductos();

  // Renderizar la interfaz
  renderizarNavbar();
  renderizarCatalogo();
  actualizarContadorCarrito();

  // Agregar event listeners
  configurarEventListeners();
}

/**
 * Configura los event listeners globales
 */
function configurarEventListeners(): void {
  // Listener para el botón de carrito
  const btnCarrito = document.getElementById('btn-carrito');
  btnCarrito?.addEventListener('click', toggleCarrito);

  // Listener para cerrar sesión
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  btnCerrarSesion?.addEventListener('click', manejarCerrarSesion);
}

/**
 * Renderiza la barra de navegación
 */
function renderizarNavbar(): void {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const usuario = obtenerUsuarioActual();
  const logueado = estaLogueado();

  navbar.innerHTML = `
    <div class="navbar-content">
      <div class="navbar-left">
        <h1>🛒 TechStore</h1>
        <button id="btn-inicio" class="btn-link">Catálogo</button>
      </div>
      <div class="navbar-right">
        ${logueado ? `
          <span class="usuario-nombre">Hola, ${usuario?.nombre}</span>
          <button id="btn-cerrar-sesion" class="btn btn-secondary">Cerrar Sesión</button>
        ` : `
          <button id="btn-login" class="btn btn-secondary">Iniciar Sesión</button>
          <button id="btn-registro" class="btn btn-primary">Registrarse</button>
        `}
        <button id="btn-carrito" class="btn-carrito">
          🛒 Carrito
          <span id="carrito-contador" class="carrito-contador">0</span>
        </button>
      </div>
    </div>
  `;

  // Re-configurar listeners después de renderizar
  configurarEventListenersNavbar();
}

/**
 * Configura los event listeners del navbar
 */
function configurarEventListenersNavbar(): void {
  document.getElementById('btn-carrito')?.addEventListener('click', toggleCarrito);
  document.getElementById('btn-inicio')?.addEventListener('click', mostrarCatalogo);
  document.getElementById('btn-login')?.addEventListener('click', mostrarFormularioLogin);
  document.getElementById('btn-registro')?.addEventListener('click', mostrarFormularioRegistro);
  document.getElementById('btn-cerrar-sesion')?.addEventListener('click', manejarCerrarSesion);
}

/**
 * Renderiza el catálogo de productos
 */
function renderizarCatalogo(): void {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (productos.length === 0) {
    contenedor.innerHTML = '<p class="mensaje-vacio">No hay productos disponibles</p>';
    return;
  }

  productos.forEach(producto => {
    const card = crearTarjetaProducto(producto);
    contenedor.appendChild(card);
  });
}

/**
 * Crea una tarjeta de producto
 * @param producto - Producto a renderizar
 * @returns Elemento HTML de la tarjeta
 */
function crearTarjetaProducto(producto: Producto): HTMLElement {
  const card = document.createElement('div');
  card.className = 'producto-card';
  
  card.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
    <div class="producto-info">
      <h3 class="producto-nombre">${producto.nombre}</h3>
      <p class="producto-descripcion">${producto.descripcion}</p>
      <div class="producto-footer">
        <span class="producto-precio">$${producto.precio.toFixed(2)}</span>
        <span class="producto-stock">Stock: ${producto.stock}</span>
      </div>
      <button class="btn btn-primary btn-agregar" data-id="${producto.id}">
        Agregar al Carrito
      </button>
    </div>
  `;

  // Agregar event listener al botón
  const btnAgregar = card.querySelector('.btn-agregar');
  btnAgregar?.addEventListener('click', () => manejarAgregarAlCarrito(producto.id));

  return card;
}

/**
 * Maneja el evento de agregar producto al carrito
 * @param productoId - ID del producto a agregar
 */
function manejarAgregarAlCarrito(productoId: number): void {
  const producto = buscarProductoPorId(productos, productoId);
  
  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'error');
    return;
  }

  const agregado = agregarAlCarrito(producto, 1);

  if (agregado) {
    mostrarMensaje('Producto agregado al carrito', 'success');
    actualizarContadorCarrito();
    if (mostrandoCarrito) {
      renderizarCarrito();
    }
  } else {
    mostrarMensaje('No hay suficiente stock', 'error');
  }
}

/**
 * Actualiza el contador del carrito en el navbar
 */
function actualizarContadorCarrito(): void {
  const contador = document.getElementById('carrito-contador');
  if (contador) {
    const cantidad = obtenerCantidadTotal();
    contador.textContent = cantidad.toString();
    contador.style.display = cantidad > 0 ? 'flex' : 'none';
  }
}

/**
 * Alterna la visualización del carrito
 */
function toggleCarrito(): void {
  mostrandoCarrito = !mostrandoCarrito;
  
  if (mostrandoCarrito) {
    renderizarCarrito();
  } else {
    renderizarCatalogo();
  }
}

/**
 * Muestra el catálogo
 */
function mostrarCatalogo(): void {
  mostrandoCarrito = false;
  renderizarCatalogo();
}

/**
 * Renderiza el carrito de compras
 */
function renderizarCarrito(): void {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  const items = obtenerCarrito();
  const total = calcularTotal();

  contenedor.innerHTML = `
    <div class="carrito-container">
      <h2>🛒 Carrito de Compras</h2>
      ${items.length === 0 ? `
        <div style="text-align: center;">
          <p class="mensaje-vacio">Tu carrito está vacío</p>
          <button id="btn-volver-catalogo" class="btn btn-primary" style="margin-top: 20px;">Volver al Catálogo</button>
        </div>
      ` : `
        <div class="carrito-items">
          ${items.map(item => crearItemCarritoHTML(item)).join('')}
        </div>
        <div class="carrito-total">
          <h3>Total: ${total.toFixed(2)}</h3>
          <div class="carrito-acciones">
            <button id="btn-vaciar-carrito" class="btn btn-secondary">Vaciar Carrito</button>
            <button id="btn-finalizar-compra" class="btn btn-primary">Finalizar Compra</button>
          </div>
        </div>
      `}
    </div>
  `;

  // Agregar event listeners
  configurarEventListenersCarrito();
}

/**
 * Crea el HTML de un item del carrito
 * @param item - Item del carrito
 * @returns HTML string del item
 */
function crearItemCarritoHTML(item: any): string {
  const subtotal = calcularSubtotal(item);
  
  return `
    <div class="carrito-item">
      <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="carrito-item-imagen">
      <div class="carrito-item-info">
        <h4>${item.producto.nombre}</h4>
        <p class="carrito-item-precio">${item.producto.precio.toFixed(2)}</p>
      </div>
      <div class="carrito-item-controles">
        <button class="btn-cantidad" data-accion="decrementar" data-id="${item.producto.id}">−</button>
        <span class="cantidad">${item.cantidad}</span>
        <button class="btn-cantidad" data-accion="incrementar" data-id="${item.producto.id}">+</button>
      </div>
      <div class="carrito-item-subtotal">
        <p>${subtotal.toFixed(2)}</p>
        <button class="btn-eliminar" data-id="${item.producto.id}" title="Eliminar producto">🗑️</button>
      </div>
    </div>
  `;
}

/**
 * Configura los event listeners del carrito
 */
function configurarEventListenersCarrito(): void {
  // Botones de cantidad
  document.querySelectorAll('.btn-cantidad').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const accion = target.dataset.accion;
      const id = parseInt(target.dataset.id || '0');

      if (accion === 'incrementar') {
        const exito = incrementarCantidad(id);
        if (!exito) {
          mostrarMensaje('No hay más stock disponible', 'error');
        }
      } else if (accion === 'decrementar') {
        decrementarCantidad(id);
      }

      actualizarContadorCarrito();
      renderizarCarrito();
    });
  });

  // Botones de eliminar
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const id = parseInt(target.dataset.id || '0');
      eliminarDelCarrito(id);
      actualizarContadorCarrito();
      renderizarCarrito();
      mostrarMensaje('Producto eliminado del carrito', 'info');
    });
  });

  // Botón vaciar carrito
  document.getElementById('btn-vaciar-carrito')?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      vaciarCarrito();
      actualizarContadorCarrito();
      renderizarCarrito();
      mostrarMensaje('Carrito vaciado', 'info');
    }
  });

  // Botón finalizar compra
  document.getElementById('btn-finalizar-compra')?.addEventListener('click', manejarFinalizarCompra);

  // Botón volver al catálogo
  document.getElementById('btn-volver-catalogo')?.addEventListener('click', mostrarCatalogo);
}

/**
 * Maneja el proceso de finalizar compra
 */
function manejarFinalizarCompra(): void {
  if (!estaLogueado()) {
    mostrarMensaje('Debes iniciar sesión para realizar la compra', 'error');
    setTimeout(() => mostrarFormularioLogin(), 1000);
    return;
  }

  if (carritoVacio()) {
    mostrarMensaje('El carrito está vacío', 'error');
    return;
  }

  const total = calcularTotal();
  const usuario = obtenerUsuarioActual();

  if (confirm(`¿Confirmar compra por $${total.toFixed(2)}?`)) {
    // Simular compra exitosa
    mostrarMensaje(`¡Compra realizada exitosamente! Gracias ${usuario?.nombre}`, 'success');
    vaciarCarrito();
    actualizarContadorCarrito();
    setTimeout(() => mostrarCatalogo(), 2000);
  }
}

/**
 * Muestra el formulario de login
 */
function mostrarFormularioLogin(): void {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  mostrandoCarrito = false;

  contenedor.innerHTML = `
    <div class="form-container">
      <h2>Iniciar Sesión</h2>
      <form id="form-login" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email:</label>
          <input type="email" id="login-email" required placeholder="tu@email.com">
        </div>
        <div class="form-group">
          <label for="login-password">Contraseña:</label>
          <input type="password" id="login-password" required placeholder="Mínimo 6 caracteres">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-full-width">Iniciar Sesión</button>
          <button type="button" id="btn-ir-registro" class="btn btn-link">¿No tienes cuenta? Regístrate</button>
        </div>
        <div class="info-demo">
          <p><strong>Usuario demo:</strong></p>
          <p>Email: demo@ejemplo.com</p>
          <p>Contraseña: 123456</p>
        </div>
      </form>
    </div>
  `;

  // Event listeners
  document.getElementById('form-login')?.addEventListener('submit', manejarLogin);
  document.getElementById('btn-ir-registro')?.addEventListener('click', mostrarFormularioRegistro);
}

/**
 * Maneja el envío del formulario de login
 */
function manejarLogin(e: Event): void {
  e.preventDefault();

  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const password = (document.getElementById('login-password') as HTMLInputElement).value;

  const resultado = loginUsuario({ email, password });

  if (resultado.exito) {
    mostrarMensaje(resultado.mensaje, 'success');
    renderizarNavbar();
    setTimeout(() => mostrarCatalogo(), 1000);
  } else {
    mostrarMensaje(resultado.mensaje, 'error');
  }
}

/**
 * Muestra el formulario de registro
 */
function mostrarFormularioRegistro(): void {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  mostrandoCarrito = false;

  contenedor.innerHTML = `
    <div class="form-container">
      <h2>Registrarse</h2>
      <form id="form-registro" class="auth-form">
        <div class="form-group">
          <label for="registro-nombre">Nombre completo:</label>
          <input type="text" id="registro-nombre" required placeholder="Tu nombre">
        </div>
        <div class="form-group">
          <label for="registro-email">Email:</label>
          <input type="email" id="registro-email" required placeholder="tu@email.com">
        </div>
        <div class="form-group">
          <label for="registro-password">Contraseña:</label>
          <input type="password" id="registro-password" required placeholder="Mínimo 6 caracteres">
        </div>
        <div class="form-group">
          <label for="registro-confirmar">Confirmar contraseña:</label>
          <input type="password" id="registro-confirmar" required placeholder="Repite tu contraseña">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-full-width">Registrarse</button>
          <button type="button" id="btn-ir-login" class="btn btn-link">¿Ya tienes cuenta? Inicia sesión</button>
        </div>
      </form>
    </div>
  `;

  // Event listeners
  document.getElementById('form-registro')?.addEventListener('submit', manejarRegistro);
  document.getElementById('btn-ir-login')?.addEventListener('click', mostrarFormularioLogin);
}

/**
 * Maneja el envío del formulario de registro
 */
function manejarRegistro(e: Event): void {
  e.preventDefault();

  const nombre = (document.getElementById('registro-nombre') as HTMLInputElement).value;
  const email = (document.getElementById('registro-email') as HTMLInputElement).value;
  const password = (document.getElementById('registro-password') as HTMLInputElement).value;
  const confirmarPassword = (document.getElementById('registro-confirmar') as HTMLInputElement).value;

  const resultado = registrarUsuario({ nombre, email, password, confirmarPassword });

  if (resultado.exito) {
    mostrarMensaje(resultado.mensaje, 'success');
    renderizarNavbar();
    setTimeout(() => mostrarCatalogo(), 1000);
  } else {
    mostrarMensaje(resultado.mensaje, 'error');
  }
}

/**
 * Maneja el cierre de sesión
 */
function manejarCerrarSesion(): void {
  if (confirm('¿Estás seguro de cerrar sesión?')) {
    cerrarSesion();
    vaciarCarrito();
    actualizarContadorCarrito();
    renderizarNavbar();
    mostrarCatalogo();
    mostrarMensaje('Sesión cerrada exitosamente', 'info');
  }
}

/**
 * Muestra un mensaje temporal en la pantalla
 * @param mensaje - Texto del mensaje
 * @param tipo - Tipo de mensaje (success, error, info)
 */
function mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
  // Eliminar mensajes anteriores
  const mensajeAnterior = document.querySelector('.mensaje-notificacion');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }

  // Crear nuevo mensaje
  const div = document.createElement('div');
  div.className = `mensaje-notificacion mensaje-${tipo}`;
  div.textContent = mensaje;

  document.body.appendChild(div);

  // Mostrar con animación
  setTimeout(() => div.classList.add('mostrar'), 10);

  // Ocultar después de 3 segundos
  setTimeout(() => {
    div.classList.remove('mostrar');
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);