/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Recent from './Components/Recent'
import Bin from './Components/Bin'
import Collections from './Components/Collections'
import DataTable from './Components/DataTable'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='recent' element={<Recent/>}/>
                <Route path='bin' element={<Bin/>} />
                <Route path='collections' element={<Collections/>}/>
                <Route path='/dataTable' element={<DataTable/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App