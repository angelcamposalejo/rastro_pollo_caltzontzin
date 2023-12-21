import { inventarioStore } from "../config"

export const createMantenimiento = async (carga) => {
    try {
        inventarioStore
            .collection("mantenimiento")
            .add({
                'vehiculo' : carga.vehiculo,
                'fecha' : carga.fecha,
                'create' : carga.create,
                'kilometraje' : carga.kilometraje
            })
        return "success"
    } catch (error) {
        return error
    }
}

export const updateMantenimiento = async (id,carga) => {
    try {
        await inventarioStore
        .collection("mantenimiento")
        .doc(id)
        .update({
            'estatus' : carga.estatus,
            'realizado' : carga.realizado
        })
        return "success"
      } catch (error) {
        return error
      }
}