import React,{useEffect, useState} from "react";
import Swal from "sweetalert2"
import { HiSave } from "react-icons/hi";
import { FaOilCan } from "react-icons/fa";
import { FaTools } from "react-icons/fa";
import { FaTruckFront } from "react-icons/fa6";
import { CSVLink } from "react-csv";
//import { IoIosWarning } from "react-icons/io";
//import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { inventarioStore } from "../config";
import { createCarga, updateGasolina } from "../crud/gasolina";
import { createMantenimiento } from "../crud/mantenimiento";

const Gasolina = () => {

    const [cargaActual, setCargaActual] = useState("")
    const [cargaAnterior, setCargaAnterior] = useState(0)
    const [cargaGasolina, setCargaGasolina] = useState([])
    const [chofer, setChofer] = useState("")
    const [fechaActual, setFechaActual] = useState("")
    const [fechaConteo, setFechaConteo] = useState("")
    const [fechaConsultada, setFechaConsultada] = useState("")
    const [fechaUltimaCarga, setFechaUltimaCarga] = useState("")
    const [fechaUltimoConteo, setFechaUltimoConteo] = useState("")
    const [fechaUltimaMantenimiento, setFechaUltimoMantenimiento] = useState("")
    const [flotillaList, setFlotillaList] = useState([])
    const [hayCarga, setHayCarga] = useState(false)
    const [hayResultado, setHayResultados] = useState(false)
    const [hayResultadoServicio, setHayResultadosServicio] = useState(false)
    const [idUltimaCarga, setIdUltimaCarga] = useState("0")
    const [isConsultar, setIsConsultar] = useState(false)
    const [isRegistro, setIsRegistro] = useState(false)
    const [kilometrajeAnterior, setKilometrajeAnterior] = useState(0)
    const [kilometrajeActual, setKilometrajeAactual] = useState("")
    const [kilometrosRecorridos, setKilometrosRecorridos] = useState(0)
    const [kilometrosRestantes, setKilometrosRestantes] = useState(0)
    const [mostrar, setMostar] = useState([])
    const [nombreArchivo, setNombreArchivo] = useState("")
    const [nombreArchivoServicio, setNombreArchivoServicio] = useState("")
    const [rendimiento, setRendimiento] = useState(0)
    const [sePuedeRegistrar, setSepuedeRegistrar] = useState(false)
    const [vehiculos, setVehiculos] = useState([])
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("General")
    const [isControlGasolina, setIsControlGasolina] = useState(true)
    const [isControMantenimiento, setIsControlMantenimiento]= useState(false)

    const [mantenimientoList, setMantenimientoList]= useState([])
    const [mostrarMantenimiento, setMostrarMantenimiento] = useState([])
    
    const headers = [
        { label: "VEHICULO", key: "vehiculo"},
        { label: "CHOFER", key: "chofer"},
        { label: "KM INICIAL", key: "kmInicial"},
        { label: "KM FINAL", key: "kmFinal"},
        { label: "KM RECORRIDOS", key: "kmRecorridos"},
        { label: "CARGA EN LTS", key: "gasolina"},
        { label: "META", key: "Meta"},
        { label: "ALCANCE EN %", key: "Alcance"},
        { label: "FECHA DE CARGA", key: "fecha"},
      ];

    const csvreport = {
        data: mostrar,
        headers: headers,
        filename: nombreArchivo+ '.csv',
    };

    const headersServicio = [
        { label: "VEHICULO", key: "vehiculo"},
        { label: "KILOMETRAJE", key: "kilometraje"},
        { label: "FECHA DEl SERVICIO", key: "fecha"},
      ];

    const csvreportServicio = {
        data: mostrarMantenimiento,
        headers: headersServicio,
        filename: nombreArchivoServicio+ '.csv',
    };

    const headersFlotilla = [
        { label: "VEHICULO", key: "vehiculo"},
        { label: "Ultimo Servicio Realizado el", key: "fechaUltimoMantenimientoVehiculo"},
        { label: "Kilometros Faltantes para Servicio", key: "kilometrosFaltantes"},
        { label: "Ultima Carga de Gasolina", key: "fechaUltimaCarga"},
        { label: "Litros Ultima Carga de Gasolina", key: "ultimaGasolina"},
        { label: "Kilometraje Actual", key: "ultimoKilometraje"},
      ];

    const csvreportFlotilla = {
        data: flotillaList,
        headers: headersFlotilla,
        filename: 'Relacion Flotilla al' +fechaActual+ '.csv',
    };

    const styleActive = { color: "white", margin: "5px auto 5px", height: "25px", fontSize:"3.0em"}

    useEffect(()=>{
        let today = new Date()
        setFechaActual(today.getFullYear()+"-"+(today.getMonth()+1).toString().padStart(2,"0")+"-"+today.getDate().toString().padStart(2,"0"))

        inventarioStore.collection("vehiculos").orderBy("nombre", "asc")
        .onSnapshot(snap => {
            const prod = []
            snap.forEach(doc => {
                prod.push({ id: doc.id, ...doc.data() })
            })
            setVehiculos(prod)
        },(error)=>{
            setVehiculos([])
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error,
            })
        })

        inventarioStore.collection("carga").orderBy("fecha", "desc")
        .onSnapshot(snap => {
            const inventario = []
            snap.forEach(doc => {
                inventario.push({ id: doc.id, ...doc.data() })
            })

            if(inventario.length > 0){
                setFechaUltimoConteo(inventario[0].fecha)
                setHayCarga(true)
            }
            else{
                setFechaUltimoConteo("")
                setHayCarga(false)
            }
            setCargaGasolina(inventario)
        },(error)=>{  
            setCargaGasolina([])
            setFechaUltimoConteo("")
            setHayCarga(false)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error,
            })
        })

        inventarioStore.collection("mantenimiento").orderBy("fecha", "desc")
        .onSnapshot(snap => {
            const inventario = []
            snap.forEach(doc => {
                inventario.push({ id: doc.id, ...doc.data() })
            })
            setMantenimientoList(inventario)
        },(error)=>{  
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error,
            })
        })
    },[])

    useEffect(()=>{
        if(vehiculoSeleccionado){
            if(vehiculoSeleccionado !== "General"){
                setSepuedeRegistrar(true)
                let fechaUltimaCarga = "0"
                let ultimoKilometraje = 0
                let ultimaGasolina = 0
                for(let i = 0; i < cargaGasolina.length; i++){
                    if(vehiculoSeleccionado === cargaGasolina[i].vehiculo){
                        if(fechaUltimaCarga === "0"){
                            fechaUltimaCarga = cargaGasolina[i].fecha
                            ultimoKilometraje = cargaGasolina[i].kmInicial
                            ultimaGasolina = cargaGasolina[i].gasolina
                            setIdUltimaCarga(cargaGasolina[i].id)
                        }
                    }
                }

                if(fechaUltimaCarga === "0"){
                    for(let i = 0; i < vehiculos.length; i++){
                        if(vehiculoSeleccionado === vehiculos[i].nombre){
                            fechaUltimaCarga = vehiculos[i].fechaInicial
                            ultimoKilometraje = vehiculos[i].kilomotrajeInicial
                            ultimaGasolina = vehiculos[i].cargaInicial
                            setIdUltimaCarga("0")
                        }
                    }
                }
                setFechaUltimaCarga(fechaUltimaCarga)
                setKilometrajeAnterior(ultimoKilometraje)
                setCargaAnterior(ultimaGasolina)
                
            }
            else{
                setFechaUltimaCarga("")
                setKilometrajeAnterior(0)
                setCargaAnterior(0)
                setIdUltimaCarga("0")
                setSepuedeRegistrar(false)
            }
        }
        else{
            setFechaUltimaCarga("")
            setKilometrajeAnterior(0)
            setCargaAnterior(0)
            setIdUltimaCarga("0")
            setSepuedeRegistrar(false)
        }
    },[vehiculoSeleccionado,cargaGasolina,vehiculos])

    useEffect(()=>{
        if(kilometrajeActual && cargaGasolina){
            try{
                if(kilometrajeActual - kilometrajeAnterior >= 0){
                    setKilometrosRecorridos(kilometrajeActual - kilometrajeAnterior)
                }
                else{
                    setKilometrosRecorridos("")
                }
                
            }
            catch{
                setKilometrosRecorridos("")
            }
        }
        else{
            setKilometrosRecorridos("")
        }
    },[kilometrajeActual,cargaGasolina,kilometrajeAnterior])

    useEffect(()=>{
        if(kilometrosRecorridos){
            try{
                if(cargaAnterior === 0){
                    setRendimiento(0)
                }
                else{
                    if(kilometrosRecorridos && cargaAnterior){
                        setRendimiento(kilometrosRecorridos / cargaAnterior)
                    }
                    else{
                        setRendimiento(0)
                    }
                }
            }
            catch{
                setRendimiento(0)
            }
        }
    },[kilometrosRecorridos,cargaAnterior])

    useEffect(()=>{
        if(cargaGasolina){
            if(cargaGasolina.length > 0){
                let elementos = []
                let kmTotales = 0
                let litrosTotales = 0
                let litrosPendientes = 0
                let rendimientoTotal = 0
                let cantidadTotal = 0
                for(let i = 0; i < cargaGasolina.length; i++){
                    if(sePuedeRegistrar && !isConsultar){
                        if(cargaGasolina[i].vehiculo === vehiculoSeleccionado){
                            if(cargaGasolina[i].kmFinal){
                                cargaGasolina[i].Class = "Gasolina"
                                cargaGasolina[i].Meta = "18"
                                cargaGasolina[i].Alcance = (parseFloat(cargaGasolina[i].rendimiento) * 100) / 18
                                kmTotales = kmTotales + cargaGasolina[i].kmRecorridos
                                litrosTotales = litrosTotales + parseFloat(cargaGasolina[i].gasolina)
                                cantidadTotal = cantidadTotal + 1
                                rendimientoTotal = rendimientoTotal + parseFloat(cargaGasolina[i].rendimiento)
                            }
                            else{
                                cargaGasolina[i].Class = "Pendiente"
                                litrosPendientes = litrosPendientes + parseFloat(cargaGasolina[i].gasolina)
                            }
                            elementos.push(cargaGasolina[i])
                        }
                    }
                    else{
                        let fechaABuscar = fechaUltimoConteo
                        if(fechaConsultada){
                            fechaABuscar = fechaConsultada
                        }
                        
                        if(cargaGasolina[i].fecha === fechaABuscar){
                            if(cargaGasolina[i].kmFinal){
                                cargaGasolina[i].Class = "Gasolina"
                                cargaGasolina[i].Meta = "18"
                                cargaGasolina[i].Alcance = (parseFloat(cargaGasolina[i].rendimiento) * 100) / 18
                                kmTotales = kmTotales + cargaGasolina[i].kmRecorridos
                                litrosTotales = litrosTotales + parseFloat(cargaGasolina[i].gasolina)
                                cantidadTotal = cantidadTotal + 1
                                rendimientoTotal = rendimientoTotal + parseFloat(cargaGasolina[i].rendimiento)
                            }
                            else{
                                cargaGasolina[i].Class = "Pendiente"
                                litrosPendientes = litrosPendientes + parseFloat(cargaGasolina[i].gasolina)
                            }
                            elementos.push(cargaGasolina[i])
                        }
                    }
                }

                //rendimientoTotal = parseFloat(kmTotales) / parseFloat(litrosTotales)
                let alcanceTotal = (parseFloat(rendimientoTotal) * 100) / 18
                let kmPromedio = (kmTotales / cantidadTotal)
                let litrosPromedio = (litrosTotales / cantidadTotal)
                let rendimientoPromedio = kmPromedio / litrosPromedio
                let alcancePromedio = (parseFloat(rendimientoPromedio) * 100) / 18
                elementos.push({
                    "id": "TotalSuma",
                    "vehiculo": "",
                    "create": "",
                    "kmInicial": "",
                    "rendimiento": rendimientoTotal,
                    "fecha": "",
                    "kmRecorridos": kmTotales,
                    "gasolina": litrosTotales,
                    "kmFinal": "Total Suma",
                    "chofer": "",
                    "Class": "TotalSuma",
                    "Meta": "",
                    "Alcance": alcanceTotal
                })
                if(kmTotales > 0){
                    elementos.push({
                        "id": "TotalPromedio",
                        "vehiculo": "",
                        "create": "",
                        "kmInicial": "",
                        "rendimiento": rendimientoPromedio,
                        "fecha": "",
                        "kmRecorridos": kmPromedio,
                        "gasolina": litrosPromedio,
                        "kmFinal": "Total Promedio",
                        "chofer": "",
                        "Class": "TotalPromedio",
                        "Meta": "",
                        "Alcance": alcancePromedio
                    })
                    elementos.push({
                        "id": "TotalLKm",
                        "vehiculo": "",
                        "create": "",
                        "kmInicial": "",
                        "rendimiento": "",
                        "fecha": "",
                        "kmRecorridos": (45 / kmPromedio),
                        "gasolina": "",
                        "kmFinal": "TOTAL L * KM",
                        "chofer": "",
                        "Class": "TotalLKm",
                        "Meta": "",
                        "Alcance": ""
                    })
                }
                elementos.push({
                    "id": "TotalLPendientes",
                    "vehiculo": "",
                    "create": "",
                    "kmInicial": "",
                    "rendimiento": "",
                    "fecha": "",
                    "kmRecorridos": "L Por Consumir",
                    "gasolina": litrosPendientes,
                    "kmFinal": "",
                    "chofer": "",
                    "Class": "TotalLKm",
                    "Meta": "",
                    "Alcance": ""
                })
                setNombreArchivo("Carga de Gasolina " + vehiculoSeleccionado + " al " + fechaActual)
                setHayResultados(true)
                setMostar(elementos)
            }
            else{
                setHayResultados(false)
                setMostar([])
            }
        }
        else{
            setHayResultados(false)
            setMostar([])
        }
    },[cargaGasolina,fechaActual,vehiculoSeleccionado,sePuedeRegistrar,fechaConsultada,fechaUltimoConteo,isConsultar])

    useEffect(()=>{
        if(mantenimientoList){
            if(mantenimientoList.length > 0){
                if(vehiculoSeleccionado === "General"){
                    setMostrarMantenimiento(mantenimientoList)
                    setHayResultadosServicio(true)
                    setNombreArchivoServicio("Servicios de vehiculos al " + fechaActual)
                }
                else{
                    let resultados = []
                    for(let i=0;i<mantenimientoList.length;i++){
                        if(mantenimientoList[i].vehiculo === vehiculoSeleccionado){
                            resultados.push(mantenimientoList[i])
                        }
                    }

                    if(resultados.length > 0){
                        setFechaUltimoMantenimiento(resultados[0].fecha + " " + resultados[0].kilometraje + " km")
                        try{
                            let kilometrosAvanzados = parseFloat(kilometrajeAnterior) - parseFloat(resultados[0].kilometraje)
                            let kilometros = parseFloat(10000) - kilometrosAvanzados
                            console.log(kilometros)
                            setKilometrosRestantes(kilometros)
                        }
                        catch{

                        }
                    }
                    setNombreArchivoServicio("Servicios de " + vehiculoSeleccionado + " al " + fechaActual)
                    
                    if(resultados.length > 0){
                        setHayResultadosServicio(true)
                    }
                    else{
                        setHayResultadosServicio(false)
                    }
                    setMostrarMantenimiento(resultados)
                }
            }
            else{
                setMostrarMantenimiento([])
                setFechaUltimoMantenimiento("")
                setNombreArchivoServicio("")
                setHayResultadosServicio(false)
            }
        }
        else{
            setMostrarMantenimiento([])
            setHayResultadosServicio(false)
            setNombreArchivoServicio("")
            setFechaUltimoMantenimiento("")
        }
    },[mantenimientoList,vehiculoSeleccionado,kilometrajeAnterior,fechaActual])

    useEffect(()=>{
        let flotilla = []
        for(let i=0; i < vehiculos.length; i++){
            let ultimoKilometraje = 0
            let ultimaGasolina = 0
            let fechaUltimaCarga = "0"
            let fechaUltimoMantenimientoVehiculo = "0"
            let kilometrosFaltantes = 0
            for(let j = 0; j < cargaGasolina.length; j++){
                if(vehiculos[i].nombre === cargaGasolina[j].vehiculo){
                    if(fechaUltimaCarga === "0"){
                        fechaUltimaCarga = cargaGasolina[j].fecha
                        ultimoKilometraje = cargaGasolina[j].kmInicial
                        ultimaGasolina = cargaGasolina[j].gasolina
                    }
                }
            }

            let resultados = []
            for(let j=0;j<mantenimientoList.length;j++){
                if(mantenimientoList[j].vehiculo === vehiculos[i].nombre){
                    resultados.push(mantenimientoList[j])
                }
            }

            if(resultados.length > 0){
                fechaUltimoMantenimientoVehiculo = resultados[0].fecha
                try{
                    let kilometrosAvanzados = parseFloat(ultimoKilometraje) - parseFloat(resultados[0].kilometraje)
                    let kilometros = parseFloat(10000) - kilometrosAvanzados
                    kilometrosFaltantes = kilometros
                }
                catch{

                }
            }

            flotilla.push({
                'vehiculo' : vehiculos[i].nombre,
                'fechaUltimoMantenimientoVehiculo' : fechaUltimoMantenimientoVehiculo,
                'kilometrosFaltantes' : kilometrosFaltantes,
                'fechaUltimaCarga' : fechaUltimaCarga,
                'ultimoKilometraje' : ultimoKilometraje,
                'ultimaGasolina' : ultimaGasolina,
            })
        }

        setFlotillaList(flotilla)
    },[vehiculos,cargaGasolina,kilometrajeAnterior,mantenimientoList])

    const handleCancelarRegistroClick = () => (event) => {
        event.preventDefault()
        setCargaActual("")
        setFechaConteo("")
        setKilometrajeAactual("")
        setIsRegistro(false)
        setRendimiento("")
    }

    const handleGuardarClick = () => (event) => {
        event.preventDefault()
        let conteoObject = {
            'vehiculo' : vehiculoSeleccionado,
            'fecha' : fechaConteo,
            'kmInicial' : kilometrajeActual,
            'gasolina' : cargaActual,
            'create' : fechaActual,
            'chofer' : chofer
        }
        console.log(conteoObject)

        if(idUltimaCarga !== "0"){
            let actualizarObjeto = {
                'kmFinal' : kilometrajeActual,
                'rendimiento':  rendimiento,
                'kmRecorridos': kilometrosRecorridos
            }
            actualizarEvento(actualizarObjeto)
            solicitarEvento()
        }
        else{
            solicitarEvento()
        }
        async function solicitarEvento(){
            const response = await createCarga(conteoObject)

            if(response === "success"){//Registro de evento exitoso
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización de gasolina',
                    text: 'Actualización de carga de gasolina correcta',
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#04afaa",
                  }).then((result) => {
                    if (result.isConfirmed) {
                        //Se solicita el registro del evento
                        //setProductoName("")
                        setKilometrajeAactual("")
                        setFechaConteo("")
                        setRendimiento("")
                        setChofer("")
                        setCargaActual("")
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

        async function actualizarEvento(objeto){
            const response = await updateGasolina(idUltimaCarga,objeto)
            console.log(response)
        }
    }

    const handleVehiculoChange = (value) => {
        setVehiculoSeleccionado(value)
    };

    const onChangeCargaActual = (cantidad) => {
        setCargaActual(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeChofer = (cantidad) => {
        setChofer(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeDateConteo = (date) => {
        setFechaConteo(date.target.value)
    };

    const onChangeKilometrajeActual = (cantidad) => {
        setKilometrajeAactual(cantidad.target.value.toString().toUpperCase())
    };

    const handleRegistrarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(true)
        setIsConsultar(false)
    }

    const handleMenuClick = (opcion) => (event) => {
        event.preventDefault()
        switch(opcion){
            case 1:
                setIsControlGasolina(true)
                setIsControlMantenimiento(false)
                break
            case 2:
                setIsControlGasolina(false)
                setIsControlMantenimiento(true)
                break
            case 3:
                setIsControlGasolina(false)
                setIsControlMantenimiento(false)
                break
            default:
                setIsControlGasolina(true)
                setIsControlMantenimiento(false)
                break
        }
    }

    const handleConsultarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(false)
        setIsConsultar(true)
    }

    const handleConsultarUltimaCargaClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(false)
        setFechaConsultada(fechaUltimoConteo)
        setIsConsultar(true)
    }

    const onChangeDateConsulta = (date) => {
        setFechaConsultada(date.target.value)
    };

    const handleMostrarInformaciónClick = () => (event) => {
        event.preventDefault()
        Swal.fire({
            customClass:'modalRegistro',
            html:`<div class="form_wrapper">
                <div class="form_container">
                    <div class="row clearfix">
                        <div class="">
                            <form autocomplete="off" method="post">
                                <h2 class="modalTitle">Mantenimiento `+vehiculoSeleccionado+` </h2>
                                <br />
                                <div class="input_field">
                                    <p>Fecha en que se realizo el mantenimiento</p>
                                    <input type="date" name="inputNombre" id="inputNombre" 
                                    placeholder="Ingrese el nombre del usuario" required  class="inputText" autocomplete="off" 
                                    value="`+fechaActual+`" 
                                    />
                                </div>
                                <div class="input_field">
                                    <p>Kilometraje</p>
                                    <input type="text" name="inputCedula" id="inputCedula" 
                                    placeholder="Ingrese el Kilometraje al momento del servicio" required class="inputText" autocomplete="off" 
                                    value=""/>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`,
            showCancelButton: true,
            denyButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            denyButtonColor: "red",
            cancelButtonColor: "grey",
            confirmButtonText: "Actualizar",
            confirmButtonColor: "#04afaa",
            scrollbarPadding:false,
            width:'500px',
            heightAuto: false,
            focusConfirm: false,
            showCloseButton:true,
            preConfirm: () => {
                if (document.getElementById('inputNombre').value) {//Se verifica que se haya proporcionado un nombre de usuario valido
                    if (document.getElementById('inputCedula').value) {//Se verifica que se haya proporcionado un nombre de usuario valido
                        alert("aqui")
                        let conteoObject = {
                            'vehiculo' : vehiculoSeleccionado,
                            'fecha' : document.getElementById('inputNombre').value,
                            'kilometraje' : document.getElementById('inputCedula').value,
                            'create' : fechaActual
                        }
                        console.log(conteoObject)
                        solicitarEvento()
                        async function solicitarEvento(){
                            const response = await createMantenimiento(conteoObject)
                
                            if(response === "success"){//Registro de evento exitoso
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Registro de mantenimiento',
                                    text: 'Programacion de mantenimiento de manera exitosa',
                                    confirmButtonText: "Aceptar",
                                    confirmButtonColor: "#04afaa",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                        //Se solicita el registro del evento
                                        //setProductoName("")
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
                    } else {//Nombre de usuario invalido
                        Swal.showValidationMessage('Proporcione la fecha en que se realizo el mantenimiento')   
                    }
                } else {//Nombre de usuario invalido
                    Swal.showValidationMessage('Proporcione la fecha en que se realizo el mantenimiento')   
                }
            }
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            console.log("Aqui")
        })
    }

    return(
        <>
            {
                isControlGasolina
                    ?
                        <>
                            <div className={"contenedor"} id="contenedorHoraFinal">
                                <div id="div1">
                                    <p className='btnMenuInactive' onClick={handleMenuClick(3)}> <FaTruckFront/></p>
                                    <p className='btnMenu' onClick={handleMenuClick(1)}> <FaOilCan/></p>
                                    <p className='btnMenuInactive' onClick={handleMenuClick(2)}> <FaTools/> </p>
                                </div>
                                <div className="contenedorEncabezado">
                                    Control de Gasolina
                                </div>
                                <br />
                                {
                                    sePuedeRegistrar
                                        ?
                                            
                                            <p className='boton_actualizar' onClick={handleRegistrarClick()}> Registrar Carga de Gasolina</p>
                                        :   
                                            null
                                }
                                {
                                    hayCarga
                                        ?
                                            <>
                                                <p className='boton_actualizar' onClick={handleConsultarClick()}> Consultar Carga de Gasolina</p>
                                                <p className='boton_actualizar'onClick={handleConsultarUltimaCargaClick()}> Ultima Carga ({fechaUltimoConteo})</p>
                                            </>
                                        :
                                            null
                                }
                                <div className="contenido">
                                    <select value={vehiculoSeleccionado} onChange={(e)=>handleVehiculoChange(e.target.value)}>
                                        <option key={"General"} value={"General"}>{"General"}</option>
                                        {
                                            vehiculos.map(
                                                almacen => <option key={almacen.nombre} value={almacen.nombre}>{almacen.nombre}</option>
                                            )
                                        }
                                    </select>
                                    
                                </div>
                                <br/>
                                {
                                    sePuedeRegistrar
                                        ?
                                            <>
                                                <h3 className="modalTextResaltado">Fecha de la Ultima Carga ({fechaUltimaCarga})</h3>
                                                <h3 className="modalTextResaltado">Litros Ultima Carga ({cargaAnterior})</h3>
                                                <h3 className="modalTextResaltado">Kilometraje Anterior ({kilometrajeAnterior})</h3>
                                                <h3 className="modalTextResaltado">Fecha del ultimo servicio ({fechaUltimaMantenimiento})</h3>
                                                <h3 className="modalTextResaltado">Kilometros Restantes ({kilometrosRestantes} km)</h3>
                                            </>
                                        :
                                            null
                                }
                                {
                                    isRegistro
                                        ?
                                            <>
                                                <h3 className="modalText">Kilometraje Actual</h3>
                                                            <input 
                                                                type={"text"} 
                                                                id="kilometrajeActual" 
                                                                name="kilometrajeActual" 
                                                                className="datos"
                                                                value={kilometrajeActual}
                                                                onChange={onChangeKilometrajeActual}
                                                                placeholder="Proporcione el kilometraje actual"/>
                                                <h3 className="modalText">Kilometraje Recorrido ({kilometrosRecorridos})</h3>
                                                <h3 className="modalText">Rendimiento ({rendimiento})</h3>
                                                <h3 className="modalText">Litros Cargados</h3>
                                                            <input 
                                                                type={"text"} 
                                                                id="cargaActual" 
                                                                name="cargaActual" 
                                                                className="datos"
                                                                value={cargaActual}
                                                                onChange={onChangeCargaActual}
                                                                placeholder="Proporcione la cantidad de gasolina cargada"/>
                                                <h3 className="modalText">Fecha de la carga</h3>
                                                            <input 
                                                                type={"date"} 
                                                                id="fechaConteo" 
                                                                name="fechaConteo" 
                                                                className="datos"
                                                                value={fechaConteo}
                                                                onChange={onChangeDateConteo}/>
                                                <h3 className="modalText">Chofer</h3>
                                                            <input 
                                                                type={"text"} 
                                                                id="chofer" 
                                                                name="chofer" 
                                                                className="datos"
                                                                value={chofer}
                                                                onChange={onChangeChofer}
                                                                placeholder="Proporcione el nombre del chofer"/>
                                                <br/>
                                                <p className='boton_aceptar' onClick={handleGuardarClick()}>Guardar</p>
                                                <p className='boton_cancelar' onClick={handleCancelarRegistroClick()}>Cancelar</p>
                                            </>
                                        :
                                            isConsultar
                                            ?
                                                <div className="contenedor">
                                                    <h1 className="modalTitle">Consultar Carga de Gasolina</h1>
                                                    <h3 className="modalText">Fecha de carga</h3>
                                                    <input 
                                                        type={"date"} 
                                                        id="fechaConsultada" 
                                                        name="fechaConsultada" 
                                                        className="datos"
                                                        value={fechaConsultada}
                                                        onChange={onChangeDateConsulta}/>
                                                </div>
                                            :
                                                null
                                }
                                <div className="Table">
                                    <div className="Heading">
                                        <div className="Cell">
                                            <p>Vehiculo</p>
                                        </div>
                                        <div className="Cell">
                                            <p>Chofer</p>
                                        </div>
                                        <div className="Cell">
                                            <p>KM Inicial</p>
                                        </div>
                                        <div className="Cell">
                                            <p>KM Final</p>
                                        </div>
                                        <div className="Cell">
                                            <p>KM Recorridos</p>
                                        </div>
                                        <div className="Cell">
                                            <p>Carga en LTS</p>
                                        </div>
                                        <div className="Cell">
                                            <p>KM/LTS</p>
                                        </div>
                                        <div className="Cell">
                                            <p>META</p>
                                        </div>
                                        <div className="Cell">
                                            <p>ALCANCE EN %</p>
                                        </div>
                                        <div className="Cell">
                                            <p>Fecha Carga</p>
                                        </div>
                                    </div>
                                    {
                                        mostrar.map(inventario => 
                                            <div  className={inventario.Class} key={inventario.id}>
                                                <div className="Cell">
                                                    <p>{inventario.vehiculo.toUpperCase()}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.chofer.toUpperCase()}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.kmInicial}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.kmFinal}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.kmRecorridos}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.gasolina}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.rendimiento}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.Meta}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.Alcance}</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>{inventario.fecha}</p>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                                <br/>
                            </div>
                            {
                                hayResultado
                                    ?
                                        <CSVLink {...csvreport} className="btn-flotanteExportMedicos" title="Exportar Reporte de Gasolina Cargada" alt="Exportar"><HiSave style={styleActive}/></CSVLink>
                                    :
                                        null
                            }
                        </>
                    :
                        isControMantenimiento
                            ?
                                <>
                                    <div className={"contenedor"} id="contenedorHoraFinal">
                                        <div id="div1">
                                            <p className='btnMenuInactive' onClick={handleMenuClick(3)}> <FaTruckFront/></p>
                                            <p className='btnMenuInactive' onClick={handleMenuClick(1)}> <FaOilCan/></p>
                                            <p className='btnMenu' onClick={handleMenuClick(2)}> <FaTools/> </p>
                                        </div>
                                        <div className="contenedorEncabezado">
                                            Control de Servicio
                                        </div>
                                        <div className="contenido">
                                            <select value={vehiculoSeleccionado} onChange={(e)=>handleVehiculoChange(e.target.value)}>
                                                <option key={"General"} value={"General"}>{"General"}</option>
                                                {
                                                    vehiculos.map(
                                                        almacen => <option key={almacen.nombre} value={almacen.nombre}>{almacen.nombre}</option>
                                                    )
                                                }
                                            </select>
                                        </div>
                                        <br />
                                        {
                                            sePuedeRegistrar
                                                ?
                                                    
                                                    <>
                                                        <p className='boton_actualizar' onClick={handleMostrarInformaciónClick()}> Registrar servicio</p>
                                                        <h3 className="modalTextResaltado">Fecha del ultimo servicio ({fechaUltimaMantenimiento})</h3>
                                                        <h3 className="modalTextResaltado">Kilometros Restantes ({kilometrosRestantes} km)</h3>
                                                    </>
                                                :   
                                                    null
                                        }
                                        <div className="Table">
                                            <div className="Heading">
                                                <div className="Cell">
                                                    <p>Vehiculo</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Realizado el</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Kilometraje</p>
                                                </div>
                                            </div>
                                            {
                                                mostrarMantenimiento.map(inventario => 
                                                    <div  className="Row" key={inventario.id}>
                                                        <div className="Cell">
                                                            <p>{inventario.vehiculo.toUpperCase()}</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.fecha}</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.kilometraje}</p>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <br/>
                                    </div>
                                    {
                                        hayResultadoServicio
                                            ?
                                                <CSVLink {...csvreportServicio} className="btn-flotanteExportMedicos" title="Exportar Reporte de Servicio" alt="Exportar"><HiSave style={styleActive}/></CSVLink>
                                            :
                                                null
                                    }
                                </>
                            :
                                <>
                                    <div className={"contenedor"} id="contenedorHoraFinal">
                                        <div id="div1">
                                            <p className='btnMenu' onClick={handleMenuClick(3)}> <FaTruckFront/></p>
                                            <p className='btnMenuInactive' onClick={handleMenuClick(1)}> <FaOilCan/></p>
                                            <p className='btnMenuInactive' onClick={handleMenuClick(2)}> <FaTools/> </p>
                                        </div>
                                        <div className="contenedorEncabezado">
                                            Flotilla
                                        </div>
                                        <div className="Table">
                                            <div className="Heading">
                                                <div className="Cell">
                                                    <p>Vehiculo</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Ultimo Servicio Realizado el</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Kilometros Faltantes para servicio</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Ultima Carga de Gasolina</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Litros Ultima Carga de Gasolina</p>
                                                </div>
                                                <div className="Cell">
                                                    <p>Kilometraje Actual</p>
                                                </div>
                                            </div>
                                            {
                                                flotillaList.map(inventario => 
                                                    <div  className="Row" key={inventario.vehiculo}>
                                                        <div className="Cell">
                                                            <p>{inventario.vehiculo.toUpperCase()}</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.fechaUltimoMantenimientoVehiculo}</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.kilometrosFaltantes} Km</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.fechaUltimaCarga}</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.ultimaGasolina} lts</p>
                                                        </div>
                                                        <div className="Cell">
                                                            <p>{inventario.ultimoKilometraje} Km</p>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <br/>
                                    </div>
                                    <CSVLink {...csvreportFlotilla} className="btn-flotanteExportMedicos" title="Exportar Reporte de Flotilla" alt="Exportar"><HiSave style={styleActive}/></CSVLink>
                                </>
            }
        </>
    )
}

export default Gasolina