/* eslint-disable no-unused-vars */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import './global.css'
import DataTable from './Components/DataTable'
import Login from './Components/Login'
import PrivateRoute from './Helper/PrivateRoute'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path='/dataTable' element={<PrivateRoute><DataTable /></PrivateRoute>} />
                {/* <Route path='bin' element={<PrivateRoute><Bin /></PrivateRoute>} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default App