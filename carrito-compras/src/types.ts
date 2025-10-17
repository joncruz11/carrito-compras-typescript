// Interface para Producto
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
}

// Interface para Usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

// Interface para Item del Carrito
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// Interface para el estado de autenticación
export interface EstadoAuth {
  usuarioActual: Usuario | null;
  estaLogueado: boolean;
}

// Tipo para los datos del formulario de registro
export type DatosRegistro = {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
};

// Tipo para los datos del formulario de login
export type DatosLogin = {
  email: string;
  password: string;
};