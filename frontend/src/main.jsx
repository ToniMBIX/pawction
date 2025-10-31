import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'

import AuctionDetail from './pages/AuctionDetail.jsx'
// importa aquí tus otras páginas/rutas

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        {/* Más rutas */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
