/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import './global.css'
import DataTable from './Components/DataTable'
import Login from './Components/Login'
import Bin from './SideBarComponents/Bin'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/dataTable' element={<DataTable />} />
                <Route path='bin' element={<Bin />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App