import { Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { ConfigProvider } from './context/ConfigContext.jsx'
import Navbar from './components/Navbar.jsx'
import AvisoCerrado from './components/AvisoCerrado.jsx'
import Footer from './components/Footer.jsx'
import ScrollAlInicio from './components/ScrollAlInicio.jsx'
import RutaProtegida from './components/admin/RutaProtegida.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Novedades from './pages/Novedades.jsx'
import Pedido from './pages/Pedido.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Inicio from './pages/admin/Inicio.jsx'
import Login from './pages/admin/Login.jsx'

function Layout() {
  return (
    <>
      <ScrollAlInicio />
      <Navbar />
      <AvisoCerrado />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            {/* Sitio público */}
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="novedades" element={<Novedades />} />
              <Route path="pedido" element={<Pedido />} />
              <Route path="*" element={<NoEncontrada />} />
            </Route>

            {/* Panel de administración */}
            <Route path="admin/login" element={<Login />} />
            <Route path="admin" element={<RutaProtegida />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Inicio />} />
              </Route>
            </Route>
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App