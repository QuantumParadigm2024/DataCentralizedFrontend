/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Recent from './SideBarComponents/Recent'
import Bin from './SideBarComponents/Bin'
import Collections from './SideBarComponents/Collections'
import './global.css'
import DataTable from './Components/DataTable'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/dataTable' element={<DataTable/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App