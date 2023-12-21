import { inventarioStore } from "../config"

export const createCarga = async (carga) => {
    try {
        inventarioStore
            .collection("carga")
            .add({
                'vehiculo' : carga.vehiculo,
                'fecha' : carga.fecha,
                'kmInicial' : carga.kmInicial,
                'gasolina' : carga.gasolina,
                'create' : carga.create,
                'chofer' : carga.chofer
            })
        return "success"
    } catch (error) {
        return error
    }
}

export const updateGasolina = async (id,carga) => {
    try {
        await inventarioStore
        .collection("carga")
        .doc(id)
        .update({
            'kmFinal' : carga.kmFinal,
            'rendimiento':            carga.rendimiento,
            'kmRecorridos':             carga.kmRecorridos
        })
        return "success"
      } catch (error) {
        return error
      }
}