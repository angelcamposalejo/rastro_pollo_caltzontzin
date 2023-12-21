import { inventarioStore } from "../config"


export const createInventario = async (inventario) => {
    try {
        inventarioStore
            .collection("conteodiario")
            .add({
                'almacen' : inventario.almacen,
                'tipoProducto' : inventario.tipoProducto,
                'productoNombre' : inventario.productoNombre,
                'cantidad' : inventario.cantidad,
                'fechaProduccion' : inventario.fechaProduccion,
                'fechaConteo' : inventario.fechaConteo,
                'kilos' : inventario.kilos,
                'create' : inventario.create
            })
        return "success"
    } catch (error) {
        return error
    }
}