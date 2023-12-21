import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { HiSave } from "react-icons/hi";
import { CSVLink } from "react-csv";
import { inventarioStore } from "../config";
import { createIngreso } from "../crud/ingresos";
 const EntradasAlmacen = ({ productos, subproductos }) => {

    const [cantidadIngresada, setCantidadIngresada] = useState("")
    const [cantidadRecibida, setCantidadRecibida] = useState("")
    const [fechaActual, setFechaActual] = useState("")
    const [fechaConsulta, setFechaConsulta] = useState("")
    const [fechaRegistro, setFechaRegistro] = useState("")
    const [fechaUltimoConteo, setFechaUltimoConteo] = useState("")
    const [hayConteo, setHayConteo] = useState(false)
    const [hayResultado, setHayResultados] = useState(false)
    const [inventarioList, setInventarioList] = useState([])
    const [isConsultar, setIsConsultar] = useState(false)
    const [isRegistro, setIsRegistro] = useState(false)
    const [merma, setMerma] = useState("")
    const [mostrarList, setMostrarList] = useState([])
    const [nombreArchivo, setNombreArchivo] = useState("")
    const [productoName, setProductoName] = useState("")
    const [productosList, setProductosList] = useState([])
    const [proveedorList, setProveedorList] = useState([])
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState("Rastro Caltzontzin")
    const [sePuedeRegistrar, setSepuedeRegistrar] = useState(false)
    const [tipoProductoList, setTipoProductoList] = useState([])
    const [tipoProductoSeleccionado, setTipoProductoSeleccionado] = useState("")

    const headers = [
        { label: "Fecha de Ingreso", key: "fechaIngreso"},
        { label: "Proveedor", key: "proveedor"},
        { label: "Tipo de Producto", key: "tipoProducto"},
        { label: "Nombrel del Producto", key: "productoNombre"},
        { label: "Cantidad Recibida", key: "cantidadRecibida"},
        { label: "Cantidad Ingresada", key: "cantidadIngresada"},
        { label: "Merma", key: "merma"},
      ];

    const csvreport = {
        data: mostrarList,
        headers: headers,
        filename: nombreArchivo+ '.csv',
    };

    const styleActive = { color: "white", margin: "5px auto 5px", height: "25px", fontSize:"3.0em"}


    useEffect(()=>{
        let today = new Date()
        setFechaActual(today.getFullYear()+"-"+(today.getMonth()+1).toString().padStart(2,"0")+"-"+today.getDate().toString().padStart(2,"0"))

        inventarioStore.collection("proveedores")
        .onSnapshot(snap => {
            const objetos = []
            objetos.push({
                id : 0,
                nombre : "General",
                ubicacion : ""
            })
            snap.forEach(doc => {
                objetos.push({ id: doc.id, ...doc.data() })
            })
            setProveedorList(objetos)
        },(error)=>{  
            setProveedorList([])
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error,
          })
        })
        setProveedorSeleccionado("Rastro Caltzontzin")

        setTipoProductoList([
            {
                'id' : 'Producto',
                'nombre' : 'Producto'
            },
            {
                'id' : 'SubProducto',
                'nombre' : 'Sub-Producto'
            }
        ])
        setTipoProductoSeleccionado("Producto")

        inventarioStore.collection("ingresos").orderBy("fechaIngreso", "desc")
        .onSnapshot(snap => {
            const inventario = []
            snap.forEach(doc => {
                inventario.push({ id: doc.id, ...doc.data() })
            })

            if(inventario.length > 0){
                setFechaUltimoConteo(inventario[0].fechaIngreso)
                setHayConteo(true)
            }
            else{
                setFechaUltimoConteo("")
                setHayConteo(false)
            }
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
        const compararInformación = (attr) =>{
            return function (a,b) {
            return comparar(attr,a,b);
            }
        }
    
        function comparar(attr, obj1, obj2) {
            return obj1[attr].localeCompare(obj2[attr]);
        }

        if(inventarioList){
            if(inventarioList.length > 0){
                let mostrar = []
                let cantidadIngresadaTotal = 0
                let cantidadRecibidaTotal = 0
                let mermaTotal = 0
                for(let i= 0; i < inventarioList.length; i++){
                    let fechaBuscada = ""
                    if(!isConsultar){
                        fechaBuscada = fechaUltimoConteo
                    }
                    else{
                        fechaBuscada    = fechaConsulta
                    }

                    setNombreArchivo("Entradas a almacen proveedor " + proveedorSeleccionado + " del " + fechaBuscada)
                        let className = "Row"
                        if(inventarioList[i].fechaIngreso === fechaBuscada && (inventarioList[i].proveedor === proveedorSeleccionado || proveedorSeleccionado === "General")){
                            inventarioList[i].class = className
                            cantidadRecibidaTotal = parseFloat(cantidadRecibidaTotal) + parseFloat(inventarioList[i].cantidadRecibida)
                            cantidadIngresadaTotal = parseFloat(cantidadIngresadaTotal) + parseFloat(inventarioList[i].cantidadIngresada)
                            mermaTotal = parseFloat(mermaTotal) + parseFloat(inventarioList[i].merma)
                            mostrar.push(inventarioList[i])
                        }
                }

                if(mostrar.length > 0){
                    mostrar.sort(compararInformación('productoNombre'))
                    mostrar.push({
                        'id': "Total",
                        'proveedor' : "...",
                        'tipoProducto' : "...",
                        'productoNombre' : "Total",
                        'cantidadRecibida' : cantidadRecibidaTotal,
                        'cantidadIngresada' : cantidadIngresadaTotal,
                        'fechaIngreso' : "...",
                        'merma' : mermaTotal,
                        'create' : "",
                        'class' : "RowTotal"
                    })

                    setHayResultados(true)
                    setMostrarList(mostrar)
                }
                else{
                    setHayResultados(false)
                    setMostrarList([])
                }
            }
            else{
                setMostrarList([])
                setHayResultados(false)
            }
        }
        else{
            setMostrarList([])
            setHayResultados(false)
        }
    },[inventarioList,isConsultar,proveedorSeleccionado,fechaActual,fechaUltimoConteo,fechaConsulta])

    useEffect(()=>{
        if(tipoProductoSeleccionado){
            if(tipoProductoSeleccionado === "Producto"){
                setProductosList(productos)
            }
            else{
                setProductosList(subproductos)
            }
        }
        else{
            setProductosList([])
        }
    },[tipoProductoSeleccionado,productos,subproductos])

    useEffect(()=>{
        if(productosList){
            if(productosList.length > 0){
                setProductoName(productosList[0].nombre)
            }
        }
    },[productosList])

    useEffect(()=>{
        if(proveedorSeleccionado === "General"){
            setSepuedeRegistrar(false)
        }
        else{
            setSepuedeRegistrar(true)
        }
    },[proveedorSeleccionado])

    useEffect(()=>{
        if(cantidadRecibida){
            if(cantidadIngresada){
                try{
                    setMerma(parseFloat(cantidadIngresada) - parseFloat(cantidadRecibida))
                }
                catch{
                    setMerma("")
                }
            }
            else{
                setMerma(cantidadRecibida)
            }
        }
        else{
            setMerma("")
        }
    },[cantidadRecibida,cantidadIngresada])

    const handleCancelarRegistroClick = () => (event) => {
        event.preventDefault()
        setCantidadIngresada("")
        setCantidadRecibida("")
        setFechaRegistro("")
        setIsRegistro(false)
    }

    const handleConsultarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(false)
        setIsConsultar(true)
    }

    const handleGuardarClick = () => (event) => {
        event.preventDefault()
        let entradaObject = {
            'proveedor' : proveedorSeleccionado,
            'tipoProducto' : tipoProductoSeleccionado,
            'productoNombre' : productoName,
            'cantidadRecibida' : cantidadRecibida,
            'cantidadIngresada' : cantidadIngresada,
            'fechaIngreso' : fechaRegistro,
            'merma' : merma,
            'create' : fechaActual
        }

        solicitarIngreso()
        async function solicitarIngreso(){
            const response = await createIngreso(entradaObject)

            if(response === "success"){//Registro de evento exitoso
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización ingresos',
                    text: 'Actualización de ingresos correcta',
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#04afaa",
                  }).then((result) => {
                    if (result.isConfirmed) {
                        //Se solicita el registro del evento
                        setCantidadIngresada("")
                        setCantidadRecibida("")
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

    const handleProductoChange = (value) => {
        setProductoName(value)
    };

    const handleProveedorChange = (value) => {
        setProveedorSeleccionado(value)
    };

    const handleRegistrarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(true)
        setIsConsultar(false)
    }

    const handleTipoProductoChange = (value) => {
        setTipoProductoSeleccionado(value)
    };

    const onChangeCantidadIngresada = (cantidad) => {
        setCantidadIngresada(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeCantidadRecibida = (cantidad) => {
        setCantidadRecibida(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeDateConsulta = (date) => {
        setFechaConsulta(date.target.value)
    };


    const onChangeDateRegistro = (date) => {
        setFechaRegistro(date.target.value)
    };

    
    return (
        <>
            <div className={"contenedor"} id="contenedorHoraFinal">
                <div className="contenedorEncabezado">
                    Proveedor
                </div>
                <div className="contenido">
                    <select value={proveedorSeleccionado} onChange={(e)=>handleProveedorChange(e.target.value)}>
                        {
                            proveedorList.map(
                                almacen => <option key={almacen.id} value={almacen.nombre}>{almacen.nombre}</option>
                            )
                        }
                    </select>
                </div>
                <br />
                {
                    sePuedeRegistrar
                        ?
                            <p className='boton_actualizar' onClick={handleRegistrarClick()}> Registrar Entrada Almacen</p>
                        :
                            null
                }
                {
                    hayConteo
                        ?
                            <>
                                <p className='boton_actualizar' onClick={handleConsultarClick()}> Consultar Ingresos Almacen</p>
                                <p className='boton_actualizar'> Ultimo Ingreso ({fechaUltimoConteo})</p>
                            </>
                        :
                            null
                }
            </div>
            {
                isRegistro
                    ?
                        <div className="contenedor">
                            <h1 className="modalTitle">Registro de entradas a CEDIS</h1>
                            <h3 className="modalText">Fecha de entrada</h3>
                            <input 
                                type={"date"} 
                                id="fechaRegistro" 
                                name="fechaRegistro" 
                                className="datos"
                                value={fechaRegistro}
                                onChange={onChangeDateRegistro}/>
                            <h3 className="modalText">Tipo de producto</h3>
                            <select value={tipoProductoSeleccionado} onChange={(e)=>handleTipoProductoChange(e.target.value)}>
                                {
                                    tipoProductoList.map(
                                        almacen => <option key={almacen.id} value={almacen.nombre}>{almacen.nombre}</option>
                                    )
                                }
                            </select>
                            <br/>
                            <h3 className="modalText">Nombre del producto</h3>
                            <select value={productoName} onChange={(e)=>handleProductoChange(e.target.value)}>
                                {
                                    productosList.map(
                                        almacen => <option key={almacen.nombre} value={almacen.nombre}>{almacen.nombre}</option>
                                    )
                                }
                            </select>
                            <h3 className="modalText">Cantidad Recibida (Kg)</h3>
                            <input 
                                type={"text"} 
                                id="cantidadRecibida" 
                                name="cantidadRecibida" 
                                className="datos"
                                value={cantidadRecibida}
                                onChange={onChangeCantidadRecibida}
                                placeholder="Proporcione la cantidad recibida"/>
                            <h3 className="modalText">Cantidad Ingresada (Kg)</h3>
                            <input 
                                type={"text"} 
                                id="cantidadIngresada" 
                                name="cantidadIngresada" 
                                className="datos"
                                value={cantidadIngresada}
                                onChange={onChangeCantidadIngresada}
                                placeholder="Proporcione la cantidad ingresada"/>
                            <h3 className="modalText">Merma ({merma} Kg)</h3>
                            <p className='boton_aceptar' onClick={handleGuardarClick()}>Guardar</p>
                            <p className='boton_cancelar' onClick={handleCancelarRegistroClick()}>Cancelar</p>
                        </div>
                    :
                        isConsultar
                            ?
                                <div className="contenedor">
                                    <h1 className="modalTitle">Consultar ingresos al almacen</h1>
                                    <h3 className="modalText">Fecha de captura</h3>
                                    <input 
                                        type={"date"} 
                                        id="fechaConsulta" 
                                        name="fechaConsulta" 
                                        className="datos"
                                        value={fechaConsulta}
                                        onChange={onChangeDateConsulta}/>
                                </div>
                            :
                                null
            }
            <div className={"contenedor"} id="contenedorHoraFinal">
                <div className="Table">
                    <div className="Heading">
                        <div className="Cell">
                            <p>Fecha de ingreso</p>
                        </div>
                        <div className="Cell">
                            <p>Proveedor</p>
                        </div>
                        <div className="Cell">
                            <p>Tipo de producto</p>
                        </div>
                        <div className="Cell">
                            <p>Nombre</p>
                        </div>
                        <div className="Cell">
                            <p>Cantidad Recibida</p>
                        </div>
                        <div className="Cell">
                            <p>Cantidad Ingresada</p>
                        </div>
                        <div className="Cell">
                            <p>Merma</p>
                        </div>
                    </div>
                    {
                        hayResultado
                            ?
                                mostrarList.map(inventario => 
                                    <div  className={inventario.class} key={inventario.id}>
                                        <div className="Cell">
                                            <p>{inventario.fechaIngreso.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.proveedor.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.tipoProducto.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.productoNombre.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.cantidadRecibida} Kg</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.cantidadIngresada} Kg</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.merma} Kg</p>
                                        </div>
                                    </div>
                                )
                            :
                                <div  className={"Row"} key={"0"}>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                    <div className="Cell">
                                        <p>{"..."}</p>
                                    </div>
                                </div>
                    }
                </div>
            </div>
            {
                hayResultado
                    ?
                        <CSVLink {...csvreport} className="btn-flotanteExportMedicos" title="Exportar a CSV" alt="Exportar"><HiSave style={styleActive}/></CSVLink>
                    :
                        null
            }
        </>
    )
 }

 export default EntradasAlmacen