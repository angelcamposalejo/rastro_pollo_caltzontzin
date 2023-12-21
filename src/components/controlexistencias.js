import React,{useEffect, useState} from "react";
import Swal from "sweetalert2"
import { HiSave } from "react-icons/hi";
import { CSVLink } from "react-csv";
import { createInventario } from "../crud/existencias";
import { inventarioStore } from "../config";

const ControlExistencias = ({ productos, subproductos }) =>{

    const [almacenList, setAlmacenList] = useState([])
    const [almacenSeleccionado, setAlmacenSeleccionado] = useState("CFG")
    const [busqueda, setBusqueda] = useState("")
    const [cantidad, setCantidad] = useState("")
    const [fechaActual, setFechaActual] = useState("")
    const [fechaConsulta, setFechaConsulta] = useState("")
    const [fechaConteo, setFechaConteo] = useState("")
    const [fechaProducto, setFechaProducto] = useState("")
    const [fechaUltimoConteo, setFechaUltimoConteo] = useState("")
    const [hayConteo, setHayConteo] = useState(false)
    const [hayResultado, setHayResultados] = useState(false)
    const [inventarioList, setInventarioList] = useState([])
    const [isConsultar, setIsConsultar] = useState(false)
    const [isRegistro, setIsRegistro] = useState(false)
    const [kilos, setKilos] = useState("")
    const [mostrarList, setMostrarList] = useState([])
    const [nombreArchivo, setNombreArchivo] = useState("")
    const [productoName, setProductoName] = useState("")
    const [productosList, setProductosList] = useState([])
    const [rezagadosList, setRezagadosList] = useState([])
    const [sePuedeRegistrar, setSepuedeRegistrar] = useState(false)
    const [sexo,setSexo] = useState(false)
    const [tipoProductoList, setTipoProductoList] = useState([])
    const [tipoProductoSeleccionado, setTipoProductoSeleccionado] = useState("")
    
    const headers = [
        { label: "Fecha de Conteo", key: "fechaConteo"},
        { label: "Almacen", key: "almacen"},
        { label: "Tipo de Producto", key: "tipoProducto"},
        { label: "Nombrel del Producto", key: "productoNombre"},
        { label: "Cantidad", key: "cantidad"},
        { label: "Fecha de Produccion", key: "fechaProduccion"},
        { label: "Kilos Totales", key: "kilos"},
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
        
        inventarioStore.collection("almacenes")
        .onSnapshot(snap => {
            const almacenes = []
            snap.forEach(doc => {
                almacenes.push({ id: doc.id, ...doc.data() })
            })
            setAlmacenList(almacenes)
        },(error)=>{  
            setInventarioList([])
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error,
          })
        })
        setAlmacenSeleccionado("CFG")

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

        inventarioStore.collection("conteodiario").orderBy("fechaConteo", "desc")
        .onSnapshot(snap => {
            const inventario = []
            snap.forEach(doc => {
                inventario.push({ id: doc.id, ...doc.data() })
            })
            if(inventario.length > 0){
                setFechaUltimoConteo(inventario[0].fechaConteo)
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
                let rezagados = []
                for(let i= 0; i < inventarioList.length; i++){
                    if(!isConsultar){
                        setNombreArchivo("Conteo diaria almancen " + almacenSeleccionado + " del " + fechaActual)
                        let diasRezago = 0
                        let className = "Row"
                        if(inventarioList[i].fechaConteo === fechaUltimoConteo){
                            var fechaInicio = new Date(fechaActual).getTime();
                            var fechaFin    = new Date(inventarioList[i].fechaProduccion).getTime();

                            var diff = fechaInicio - fechaFin;

                            let diasPasados = diff/(1000*60*60*24);
                            diasRezago = diasPasados
                            inventarioList[i].rezago = diasRezago
                            let limite = 0
                            if(inventarioList[i].tipoProducto === "Producto"){
                                for(let j = 0; j < productos.length; j++){
                                    if(productos[j].nombre === inventarioList[i].productoNombre){
                                        limite = productos[j].limite
                                    }
                                }
                            }
                            else{
                                for(let j = 0; j < subproductos.length; j++){
                                    if(subproductos[j].nombre === inventarioList[i].productoNombre){
                                        limite = subproductos[j].limite
                                    }
                                }
                            }
                           
                            if(diasPasados >= limite){
                                rezagados.push(inventarioList[i])
                                className = "RowRed"
                            }

                        }

                        if(inventarioList[i].fechaConteo === fechaActual && (inventarioList[i].almacen === almacenSeleccionado || almacenSeleccionado === "General")){
                            if(diasRezago >= 2){
                                inventarioList[i].class = className
                            }
                            else{
                                inventarioList[i].class = className
                            }
                            mostrar.push(inventarioList[i])
                        }
                    }
                    else{
                        if(sexo){//busqueda por nombre del producto
                            if(busqueda.length > 0){
                                setNombreArchivo("Conteo diaria almancen " + almacenSeleccionado + " producto " + busqueda.toUpperCase())
                                if(inventarioList[i].productoNombre.toUpperCase().includes(busqueda.toUpperCase()) && (inventarioList[i].almacen === almacenSeleccionado || almacenSeleccionado === "General")){
                                    inventarioList[i].class = 'Row'
                                    mostrar.push(inventarioList[i])
                                }
                            }
                        }
                        else{//busqueda por fecha
                            setNombreArchivo("Conteo diaria almancen " + almacenSeleccionado + " del " + fechaConsulta)
                            if(inventarioList[i].fechaConteo === fechaConsulta && (inventarioList[i].almacen === almacenSeleccionado || almacenSeleccionado === "General")){
                                inventarioList[i].class = 'Row'
                                mostrar.push(inventarioList[i])
                            }
                        }
                    }
                }

                if(mostrar.length > 0){
                    mostrar.sort(compararInformación('productoNombre'))
                    setHayResultados(true)
                }
                else{
                    setHayResultados(false)
                }
                setMostrarList(mostrar)
                setRezagadosList(rezagados)
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
    },[inventarioList,almacenSeleccionado,fechaActual,fechaUltimoConteo,isConsultar,sexo,fechaConsulta,busqueda,productos,subproductos])

    useEffect(()=>{
        if(almacenSeleccionado === "General"){
            setSepuedeRegistrar(false)
        }
        else{
            setSepuedeRegistrar(true)
        }
    },[almacenSeleccionado])

    const handleAlmacenChange = (value) => {
        setAlmacenSeleccionado(value)
    };

    const handleCancelarBusquedaClick = () => (event) => {
        event.preventDefault()
        setSexo(false)
        setBusqueda("")
        setFechaConsulta("")
        setIsRegistro(false)
        setIsConsultar(false)
    }

    const handleCancelarRegistroClick = () => (event) => {
        event.preventDefault()
        setCantidad("")
        setFechaProducto("")
        setKilos("")
        setIsRegistro(false)
    }

    const handleConsultarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(false)
        setIsConsultar(true)
    }

    const handleGuardarClick = () => (event) => {
        event.preventDefault()
        let conteoObject = {
            'almacen' : almacenSeleccionado,
            'tipoProducto' : tipoProductoSeleccionado,
            'productoNombre' : productoName,
            'cantidad' : cantidad,
            'fechaProduccion' : fechaProducto,
            'fechaConteo' : fechaConteo,
            'kilos' : kilos,
            'create' : fechaActual
        }

        solicitarConteo()
        async function solicitarConteo(){
            const response = await createInventario(conteoObject)

            if(response === "success"){//Registro de evento exitoso
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización de conteo diario',
                    text: 'Actualización de inventario de conteo diario correcta',
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#04afaa",
                  }).then((result) => {
                    if (result.isConfirmed) {
                        //Se solicita el registro del evento
                        setCantidad("")
                        setFechaProducto("")
                        setKilos("")
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

    const handleRegistrarClick = () => (event) => {
        event.preventDefault()
        setIsRegistro(true)
        setIsConsultar(false)
    }

    const handleRezagosClick = () => (event) => {
        event.preventDefault()
        if(rezagadosList.length > 0){
            let rezagos = ""
            rezagos += "<h2 class=modalPacienteTitle>Rezagados</h2>"
            for(let i=0; i< rezagadosList.length;i++){
                rezagos += "<h1 class='info_itemblog'>"+rezagadosList[i].almacen + "-" + rezagadosList[i].tipoProducto + "-" + rezagadosList[i].productoNombre +  "-" + rezagadosList[i].fechaProduccion + "-" + rezagadosList[i].cantidad + " Cajas</h1>"
            }
            Swal.fire({
                html:
                rezagos,
                showCloseButton: true,
                showConfirmButton:false,
                customClass: 'swal-height'
            })
        }
    }

    const handleTipoProductoChange = (value) => {
        setTipoProductoSeleccionado(value)
    };

    const onChangeBusqueda = (cantidad) => {
        setBusqueda(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeCantidad = (cantidad) => {
        setCantidad(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeDate = (date) => {
        setFechaProducto(date.target.value)
    };

    const onChangeDateConsulta = (date) => {
        setFechaConsulta(date.target.value)
    };

    const onChangeDateConteo = (date) => {
        setFechaConteo(date.target.value)
    };

    const onChangeKilogramos = (cantidad) => {
        setKilos(cantidad.target.value.toString().toUpperCase())
    };

    const onChangeSexo = (sexo) => {
        if('Masculino' === sexo.target.value){
            setSexo(true)
        }
        else{
            setSexo(false)
        }
    };


    return(
        <>
            <div className={"contenedor"} id="contenedorHoraFinal">
                <div className="contenedorEncabezado">
                    Almacen
                </div>
                <div className="contenido">
                    <select value={almacenSeleccionado} onChange={(e)=>handleAlmacenChange(e.target.value)}>
                        {
                            almacenList.map(
                                almacen => <option key={almacen.id} value={almacen.nombre}>{almacen.nombre}</option>
                            )
                        }
                    </select>
                </div>
                <br />
                {
                    sePuedeRegistrar
                        ?
                            <p className='boton_actualizar' onClick={handleRegistrarClick()}> Registrar Conteo Diario</p>
                        :
                            null
                }
                {
                    hayConteo
                        ?
                            <>
                                <p className='boton_actualizar' onClick={handleConsultarClick()}> Consultar Conteo Diario</p>
                                <p className='boton_actualizar' onClick={handleRezagosClick()}> Ultimo Conteo ({fechaUltimoConteo})</p>
                            </>
                        :
                            null
                }
            </div>
            {
                isRegistro
                    ?
                        <div className="contenedor">
                            <h1 className="modalTitle">Registro de conteo diario</h1>
                            <h3 className="modalText">Fecha de conteo</h3>
                            <input 
                                type={"date"} 
                                id="fechaConteo" 
                                name="fechaConteo" 
                                className="datos"
                                value={fechaConteo}
                                onChange={onChangeDateConteo}/>
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
                            <h3 className="modalText">Fecha de produccion</h3>
                            <input 
                                type={"date"} 
                                id="fechaProducto" 
                                name="fechaProducto" 
                                className="datos"
                                value={fechaProducto}
                                onChange={onChangeDate}/>
                            <h3 className="modalText">Cajas</h3>
                            <input 
                                type={"text"} 
                                id="cantidad" 
                                name="cantidad" 
                                className="datos"
                                value={cantidad}
                                onChange={onChangeCantidad}
                                placeholder="Proporcione la cantidad del producto"/>
                            <h3 className="modalText">Kilogramos Totales</h3>
                            <input 
                                type={"text"} 
                                id="kilos" 
                                name="kilos" 
                                className="datos"
                                value={kilos}
                                onChange={onChangeKilogramos}
                                placeholder="Proporcione los kilogramos totales"/>
                            <br/>
                            <br/>
                            {/* <p className='boton_aceptar' onClick={handleGuardarAgregadoClick()}>Agregar</p> */}
                            <p className='boton_aceptar' onClick={handleGuardarClick()}>Guardar</p>
                            <p className='boton_cancelar' onClick={handleCancelarRegistroClick()}>Cancelar</p>
                        </div>
                    :
                        isConsultar
                                ?
                                <div className="contenedor">
                                    <h1 className="modalTitle">Consultar conteo diario</h1>
                                    <div className="datos">
                                        <input type="radio" value="Masculino" name="gender" checked={sexo === true} onChange={onChangeSexo}/> Producto
                                        <input type="radio" value="Femenino" name="gender" checked={sexo === false} onChange={onChangeSexo}/> Fecha Conteo
                                    </div>
                                    {
                                        sexo
                                            ?
                                                <>
                                                    <h3 className="modalText">Nombre del producto</h3>
                                                    <input 
                                                        type={"text"} 
                                                        id="busqueda" 
                                                        name="busqueda" 
                                                        className="datos"
                                                        value={busqueda}
                                                        onChange={onChangeBusqueda}
                                                        placeholder="Proporcione el nombre del producto"/>
                                                </>
                                            :
                                                <>
                                                    <h3 className="modalText">Fecha de captura</h3>
                                                    <input 
                                                        type={"date"} 
                                                        id="fechaConsulta" 
                                                        name="fechaConsulta" 
                                                        className="datos"
                                                        value={fechaConsulta}
                                                        onChange={onChangeDateConsulta}/>
                                                </>
                                    }
                                    <br/>
                                    <br/>
                                    <p className='boton_cancelar' onClick={handleCancelarBusquedaClick()}>Cancelar</p>
                                </div>
                                :
                                    null
            }
            <div className={"contenedor"} id="contenedorHoraFinal">
                <div className="Table">
                    <div className="Heading">
                    <div className="Cell">
                            <p>Fecha de conteo</p>
                        </div>
                        <div className="Cell">
                            <p>Almacen</p>
                        </div>
                        <div className="Cell">
                            <p>Tipo de producto</p>
                        </div>
                        <div className="Cell">
                            <p>Nombre</p>
                        </div>
                        <div className="Cell">
                            <p>Cantidad</p>
                        </div>
                        <div className="Cell">
                            <p>Fecha de produccion</p>
                        </div>
                        <div className="Cell">
                            <p>Kilos totales</p>
                        </div>
                    </div>
                    {
                        hayResultado
                            ?
                                mostrarList.map(inventario => 
                                    <div  className={inventario.class} key={inventario.id}>
                                        <div className="Cell">
                                            <p>{inventario.fechaConteo.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.almacen.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.tipoProducto.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.productoNombre.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.cantidad.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.fechaProduccion.toUpperCase()}</p>
                                        </div>
                                        <div className="Cell">
                                            <p>{inventario.kilos.toUpperCase()}</p>
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

export default ControlExistencias