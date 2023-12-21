import { inventarioStore } from "../config"


export const createDevolucion = async (inventario) => {
    try {
        inventarioStore
            .collection("devolucion")
            .add({
                'puntoVenta' : inventario.puntoVenta,
                'polloEntero' : inventario.polloEntero,
                'piernaMuslo' : inventario.piernaMuslo,
                'ala' : inventario.ala,
                'fechaConteo' : inventario.fechaConteo,
                'create' : inventario.create
            })
        return "success"
    } catch (error) {
        return error
    }
}

export const puntosVenta = [
    {
        nombre : "San Nicolas 1",
    },
    {
        nombre : "San Nicolas 2",
    },
    {
        nombre : "Yuriria 1",
    },
    {
        nombre : "Yuriria 2",
    }
]