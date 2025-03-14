/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
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