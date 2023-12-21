import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2"
import { FaTruck } from "react-icons/fa6";
import { LuClipboardList } from "react-icons/lu";
import { MdAssignmentReturned } from "react-icons/md";
import { MdAssignmentReturn } from "react-icons/md";
//import { GiChicken } from "react-icons/gi";
import { inventarioStore } from './config';
import ControlExistencias from './components/controlexistencias';
import Gasolina from './components/controlGasolina';
import Devoluciones from './components/devoluciones';
import EntradasAlmacen from './components/entradasAlmacen';
import './App.css';
import './table.css'
import './footer.css'

const App = () => {

  const [isConteoDiario, setIsConteoDiario] = useState(false)
  const [isEntradas, setIsEntradas] =useState(false)
  const [isDevoluciones, setIsDevoluciones] = useState(false)
  const [productos, setProductos] = useState([])
  const [subproductos, setSubProductos] = useState([])

  const handleMenuClick = (opcion) => (event) => {
    event.preventDefault()
    switch(opcion){
        case 1:
          setIsConteoDiario(true)
          setIsEntradas(false)
          setIsDevoluciones(false)
            break
        case 2:
          setIsConteoDiario(false)
          setIsEntradas(true)
          setIsDevoluciones(false)
            break
        case 3:
          setIsConteoDiario(false)
          setIsEntradas(false)
          setIsDevoluciones(true)
          break
        case 4:
          setIsConteoDiario(false)
          setIsEntradas(false)
          setIsDevoluciones(false)
          break
        default:
          setIsConteoDiario(true)
          setIsEntradas(false)
          setIsDevoluciones(false)
            break
    }
}
  useEffect(()=>{
    inventarioStore.collection("productos").orderBy("nombre", "asc")
    .onSnapshot(snap => {
        const prod = []
        const subprod = []
        snap.forEach(doc => {
            let objeto = doc.data()
            if(objeto.tipo === "Producto"){
                prod.push({ id: doc.id, ...doc.data() })
            }
            else{
                if(objeto.tipo === "Sub-Producto"){
                    subprod.push({ id: doc.id, ...doc.data() })
                }
            }
        })
        setProductos(prod)
        setSubProductos(subprod)
    },(error)=>{
      setProductos([])
      setSubProductos([])
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
      })
    })
  },[])

  return(
    <div className="App">
      <header className="App-header">
        <h1>Rastro de pollos Caltzontzin</h1>
        <div className='menu_top'>
          {
            isConteoDiario
              ?
                <>
                  <div className='opc_menu' onClick={handleMenuClick(4)} style={{ color: '#0582a9' }}><FaTruck/> Control de Flotilla</div>
                  <div className='opc_menu' onClick={handleMenuClick(2)} style={{ color: '#282828' }}><MdAssignmentReturned /> Ingresos</div>
                  <div className='opc_menuSeleccionada' onClick={handleMenuClick(1)} style={{ color: '#0582a9' }}><LuClipboardList /> Conteo Diario</div>
                  <div className='opc_menu' onClick={handleMenuClick(3)} style={{ color: '#282828' }}><MdAssignmentReturn /> Devoluciones</div>
                </>
              :
                isEntradas
                  ?
                    <>
                      <div className='opc_menu' onClick={handleMenuClick(4)} style={{ color: '#0582a9' }}><FaTruck/> Control de Flotilla</div>
                      <div className='opc_menuSeleccionada' onClick={handleMenuClick(2)} style={{ color: '#282828' }}><MdAssignmentReturned /> Ingresos</div>
                      <div className='opc_menu' onClick={handleMenuClick(1)} style={{ color: '#0582a9' }}><LuClipboardList /> Conteo Diario</div>
                      <div className='opc_menu' onClick={handleMenuClick(3)} style={{ color: '#282828' }}><MdAssignmentReturn /> Devoluciones</div>
                    </>
                  :
                    isDevoluciones
                      ?
                        <>
                          <div className='opc_menu' onClick={handleMenuClick(4)} style={{ color: '#0582a9' }}><FaTruck/> Control de Flotilla</div>
                          <div className='opc_menu' onClick={handleMenuClick(2)} style={{ color: '#282828' }}><MdAssignmentReturned /> Ingresos</div>
                          <div className='opc_menu' onClick={handleMenuClick(1)} style={{ color: '#0582a9' }}><LuClipboardList /> Conteo Diario</div>
                          <div className='opc_menuSeleccionada' onClick={handleMenuClick(3)} style={{ color: '#282828' }}><MdAssignmentReturn /> Devoluciones</div>
                        </>
                      :
                        <>
                          <div className='opc_menuSeleccionada' onClick={handleMenuClick(4)} style={{ color: '#282828' }}><FaTruck/> Control de Flotilla</div>
                          <div className='opc_menu' onClick={handleMenuClick(2)} style={{ color: '#282828' }}><MdAssignmentReturned /> Ingresos</div>
                          <div className='opc_menu' onClick={handleMenuClick(1)} style={{ color: '#282828' }}><LuClipboardList /> Conteo Diario</div>
                          <div className='opc_menu' onClick={handleMenuClick(3)} style={{ color: '#282828' }}><MdAssignmentReturn /> Devoluciones</div>
                        </>
          }
        </div>
        {
          isConteoDiario
            ?
              <ControlExistencias productos={productos} subproductos={subproductos}/>
            :
              isEntradas
                ?
                  <EntradasAlmacen productos={productos} subproductos={subproductos}/>
                :
                  isDevoluciones
                    ?
                      <Devoluciones />
                    :
                      <Gasolina />
        }
        <footer className='footer'>
                <div className='maxwidth'>
                    <p className='textp3'>Desarrollado por Campos&Corona Solutions <br/></p>
                    <p className='textp4'>versión: 1-1-0<br/></p>     
                </div>
            </footer>
      </header>
    </div>
  )
}

export default App;
