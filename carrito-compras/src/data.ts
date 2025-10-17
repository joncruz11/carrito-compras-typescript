import { Producto } from './types.js';

/**
 * Carga los productos desde el archivo JSON
 * @returns Promise con el array de productos
 */
export async function cargarProductos(): Promise<Producto[]> {
  try {
    const response = await fetch('../data/productos.json');
    if (!response.ok) {
      throw new Error('Error al cargar los productos');
    }
    const productos: Producto[] = await response.json();
    return productos;
  } catch (error) {
    console.error('Error cargando productos:', error);
    return [];
  }
}

/**
 * Busca un producto por su ID
 * @param productos - Array de productos
 * @param id - ID del producto a buscar
 * @returns El producto encontrado o undefined
 */
export function buscarProductoPorId(productos: Producto[], id: number): Producto | undefined {
  return productos.find(producto => producto.id === id);
}

/**
 * Filtra productos por nombre (búsqueda)
 * @param productos - Array de productos
 * @param termino - Término de búsqueda
 * @returns Array de productos filtrados
 */
export function filtrarProductos(productos: Producto[], termino: string): Producto[] {
  const terminoLower = termino.toLowerCase();
  return productos.filter(producto => 
    producto.nombre.toLowerCase().includes(terminoLower) ||
    producto.descripcion.toLowerCase().includes(terminoLower)
  );
}