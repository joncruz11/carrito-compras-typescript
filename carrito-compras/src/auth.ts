import { Usuario, EstadoAuth, DatosRegistro, DatosLogin } from './types.js';

// Clave para almacenar en memoria (simula base de datos)
let usuarios: Usuario[] = [];
let estadoAuth: EstadoAuth = {
  usuarioActual: null,
  estaLogueado: false
};

/**
 * Inicializa el sistema de autenticación
 * Carga usuarios desde memoria (en un sistema real sería desde servidor)
 */
export function inicializarAuth(): void {
  // Cargar usuarios de ejemplo (simula base de datos)
  usuarios = [
    {
      id: 1,
      nombre: "Usuario Demo",
      email: "demo@ejemplo.com",
      password: "123456"
    }
  ];
  
  // Verificar si hay sesión activa
  verificarSesion();
}

/**
 * Verifica si hay una sesión activa
 */
function verificarSesion(): void {
  // En un sistema real, verificaríamos tokens o cookies
  // Por ahora usamos variables en memoria
  if (estadoAuth.usuarioActual) {
    estadoAuth.estaLogueado = true;
  }
}

/**
 * Registra un nuevo usuario
 * @param datos - Datos del formulario de registro
 * @returns Objeto con éxito y mensaje
 */
export function registrarUsuario(datos: DatosRegistro): { exito: boolean; mensaje: string } {
  // Validar datos
  if (!datos.nombre || !datos.email || !datos.password) {
    return { exito: false, mensaje: "Todos los campos son obligatorios" };
  }

  if (datos.password !== datos.confirmarPassword) {
    return { exito: false, mensaje: "Las contraseñas no coinciden" };
  }

  if (datos.password.length < 6) {
    return { exito: false, mensaje: "La contraseña debe tener al menos 6 caracteres" };
  }

  // Verificar si el email ya existe
  const emailExiste = usuarios.some(u => u.email === datos.email);
  if (emailExiste) {
    return { exito: false, mensaje: "El email ya está registrado" };
  }

  // Crear nuevo usuario
  const nuevoUsuario: Usuario = {
    id: usuarios.length + 1,
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password // En producción, esto debe estar hasheado
  };

  usuarios.push(nuevoUsuario);
  
  // Auto-login después del registro
  estadoAuth.usuarioActual = nuevoUsuario;
  estadoAuth.estaLogueado = true;

  return { exito: true, mensaje: "Registro exitoso" };
}

/**
 * Inicia sesión de usuario
 * @param datos - Datos del formulario de login
 * @returns Objeto con éxito y mensaje
 */
export function loginUsuario(datos: DatosLogin): { exito: boolean; mensaje: string } {
  // Validar datos
  if (!datos.email || !datos.password) {
    return { exito: false, mensaje: "Email y contraseña son obligatorios" };
  }

  // Buscar usuario
  const usuario = usuarios.find(u => u.email === datos.email && u.password === datos.password);
  
  if (!usuario) {
    return { exito: false, mensaje: "Email o contraseña incorrectos" };
  }

  // Establecer sesión
  estadoAuth.usuarioActual = usuario;
  estadoAuth.estaLogueado = true;

  return { exito: true, mensaje: "Inicio de sesión exitoso" };
}

/**
 * Cierra la sesión del usuario actual
 */
export function cerrarSesion(): void {
  estadoAuth.usuarioActual = null;
  estadoAuth.estaLogueado = false;
}

/**
 * Obtiene el usuario actual
 * @returns Usuario actual o null
 */
export function obtenerUsuarioActual(): Usuario | null {
  return estadoAuth.usuarioActual;
}

/**
 * Verifica si el usuario está logueado
 * @returns true si está logueado, false si no
 */
export function estaLogueado(): boolean {
  return estadoAuth.estaLogueado;
}