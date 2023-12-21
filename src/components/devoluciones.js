import React,{useEffect, useState} from "react";
import Swal from "sweetalert2"

import { inventarioStore } from "../config";
import { puntosVenta, createDevolucion } from "../crud/puntoVenta";

const Devoluciones = () => {

    const [cantidadAla, setCantidadAla] = useState("")
    const [cantidadPM, setCantidadPM] = useState("")
    const [cantidadPolloEntero, setCantidadPolloEntero] = useState("")
    const [fechaActual, setFechaActual] = useState("")
    const [fechaConteo, setFechaConteo] = useState("")
    const [inventarioList, setInventarioList] = useState([])
    const [isRegistro, setIsRegistro] = useState(false)
    const [mostrarList, setMostrarList] = useState([])
    const [pvSeleccionado, setPvSeleccionado] = useState("General")
    const [sePuedeRegistrar, setSepuedeRegistrar] = useState(false)

    useEffect(()=>{
        let today = new Date()
        setFechaActual(today.getFullYear()+"-"+(today.getMonth()+1).toString().padStart(2,"0")+"-"+today.getDate().toString().padStart(2,"0"))
        inventarioStore.collection("devolucion").orderBy("fechaConteo", "desc")
        .onSnapshot(snap => {
            const inventario = []
            snap.forEach(doc => {
                inventario.push({ id: doc.id, ...doc.data() })
            })

            setInventarioList(inventario)
        },(error)=>{  
            setInventarioList([])
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error,
          })
        })
    },[])

    useEffect(()=>{
        if(pvSeleccionado){
            if(pvSeleccionado === "General"){
                setSepuedeRegistrar(false)
            }
            else{
                if(fechaConteo){
                    setSepuedeRegistrar(true)
                }
                else{
                    setSepuedeRegistrar(false)
                }
            }
        }
        else{
            setSepuedeRegistrar(false)
        }
    },[pvSeleccionado,fechaConteo])

    useEffect(()=>{
        if(inventarioList){
            if(inventarioList.length > 0){
                let mostrar = []
                for(let i= 0; i < inventarioList.length; i++){
                    if(inventarioList[i].fechaConteo === fechaConteo && (inventarioList[i].puntoVenta === pvSeleccionado || pvSeleccionado === "General")){
                        mostrar.push(inventarioList[i])
                    }
                }
                setMostrarList(mostrar)
            }
            else{
                setMostrarList([])
            }
        }
        else{
            setMostrarList([])
        }
    },[inventarioList,fechaConteo,pvSeleccionado])
    
    const handleCancelarRegistroClick = () => (event) => {
        event.preventDefault()
        setCantidadAla("")
        setCantidadPM("")
        setCantidadPolloEntero("")
        setIsRegistro(false)
    }

    const handleGuardarClick = () => (event) => {
        event.preventDefault()
        let conteoObject = {
            'puntoVenta' : pvSeleccionado,
            'polloEntero' : cantidadPolloEntero,
            'piernaMuslo' : cantidadPM,
            'ala' : cantidadAla,
            'fechaConteo' : fechaConteo,
            'create' : fechaActual
        }

        solicitarEvento()
        async function solicitarEvento(){
            const response = await createDevolucion(conteoObject)

            if(response === "success"){//Registro de evento exitoso
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización de devoluciones',
                    text: 'Actualización de devolucion correcta',
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#04afaa",
                  }).then((result) => {
                    if (result.isConfirmed) {
                        //Se solicita el registro del evento
                        //setProductoName("")
                        setCantidadAla("")
                        setCantidadPM("")
                        setCantidadPolloEntero("")
                        //setIsRegistro(false)
                    }
                })
            }
            else{//Error en el registro de un evento
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response,
                  })
            }
        }
    }

    const handlePVChange = (value) => {
        setPvSeleccionado(value)
    };

    const handleRegistrarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(true)
    }

    const onChangeCantidad = (cantidad) => {
        setCantidadPolloEntero(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeCantidadAla = (cantidad) => {
        setCantidadAla(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeCantidadPM = (cantidad) => {
        setCantidadPM(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeDateConteo = (date) => {
        setFechaConteo(date.target.value)
    };

    return(
        <>
            <div className={"contenedor"} id="contenedorHoraFinal">
                <div className="contenedorEncabezado">
                    Entradas/Devoluciones CEDIS
                </div>
                <div className="contenido">
                    <select value={pvSeleccionado} onChange={(e)=>handlePVChange(e.target.value)}>
                        <option key={"General"} value={"General"}>{"General"}</option>
                        {
                            puntosVenta.map(
                                almacen => <option key={almacen.nombre} value={almacen.nombre}>{almacen.nombre}</option>
                            )
                        }
                    </select>
                </div>
                <h3 className="modalText">Fecha de la devolucion</h3>
                            <input 
                                type={"date"} 
                                id="fechaConteo" 
                                name="fechaConteo" 
                                className="datos"
                                value={fechaConteo}
                                onChange={onChangeDateConteo}/>
                <br/>
                <br/>
                {
                    sePuedeRegistrar
                        ?
                            <p className='boton_actualizar' onClick={handleRegistrarClick()}> Registrar Conteo Diario</p>
                        :
                            null
                }
            </div>
            {
                isRegistro
                    ?
                        <div className="contenedor">
                            <h1 className="modalTitle">Registro de devoluciones punto de venta {pvSeleccionado}</h1>
                            <h3 className="modalText">Fecha de devolucion {fechaConteo}</h3>
                            <span>Pollo entero </span>
                            <input 
                                type={"text"} 
                                id="cantidadPolloEntero" 
                                name="cantidadPolloEntero" 
                                className="datos"
                                value={cantidadPolloEntero}
                                onChange={onChangeCantidad}
                                placeholder="Proporcione la cantidad del producto"/>
                            <br/>
                            <span>Pierna y Muslo </span>
                            <input 
                                type={"text"} 
                                id="cantidadPM" 
                                name="cantidadPM" 
                                className="datos"
                                value={cantidadPM}
                                onChange={onChangeCantidadPM}
                                placeholder="Proporcione la cantidad del producto"/>
                            <br/>
                            <span>Ala </span>
                            <input 
                                type={"text"} 
                                id="cantidadAla" 
                                name="cantidadAla" 
                                className="datos"
                                value={cantidadAla}
                                onChange={onChangeCantidadAla}
                                placeholder="Proporcione la cantidad del producto"/>
                            <br/>
                            <p className='boton_aceptar' onClick={handleGuardarClick()}>Guardar</p>
                            <p className='boton_cancelar' onClick={handleCancelarRegistroClick()}>Cancelar</p>
                        </div>
                     :
                        null
            }
            <div className="contenedor">
                <div className="Table">
                    <div className="Heading">
                        <div className="Cell">
                            <p>Fecha de conteo</p>
                        </div>
                        <div className="Cell">
                            <p>Punto de Venta</p>
                        </div>
                        <div className="Cell">
                            <p>Pollo Entero</p>
                        </div>
                        <div className="Cell">
                            <p>Pierna y Muslo</p>
                        </div>
                        <div className="Cell">
                            <p>Ala</p>
                        </div>
                    </div>
                    {
                        mostrarList.map(inventario => 
                            <div  className={"Row"} key={inventario.id}>
                                <div className="Cell">
                                    <p>{inventario.fechaConteo.toUpperCase()}</p>
                                </div>
                                <div className="Cell">
                                    <p>{inventario.puntoVenta.toUpperCase()}</p>
                                </div>
                                <div className="Cell">
                                    <p>{inventario.polloEntero.toUpperCase()}</p>
                                </div>
                                <div className="Cell">
                                    <p>{inventario.piernaMuslo.toUpperCase()}</p>
                                </div>
                                <div className="Cell">
                                    <p>{inventario.ala.toUpperCase()}</p>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default Devoluciones