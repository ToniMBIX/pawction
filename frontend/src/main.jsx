import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import AuctionDetail from './pages/AuctionDetail.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auctions/:id" element={<AuctionDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
