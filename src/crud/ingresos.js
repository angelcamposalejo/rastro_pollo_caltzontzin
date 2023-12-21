import { inventarioStore } from "../config"


export const createIngreso = async (inventario) => {
    try {
        inventarioStore
            .collection("ingresos")
            .add({
                'proveedor' : inventario.proveedor,
                'tipoProducto' : inventario.tipoProducto,
                'cantidadRecibida' : inventario.cantidadRecibida,
                'productoNombre' : inventario.productoNombre,
                'cantidadIngresada' : inventario.cantidadIngresada,
                'fechaIngreso' : inventario.fechaIngreso,
                'merma' : inventario.merma,
                'create' : inventario.create
            })
        return "success"
    } catch (error) {
        return error
    }
}