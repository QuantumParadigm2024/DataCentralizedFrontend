/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import './global.css';
import DataTable from './Components/DataTable';
import Login from './Components/Login';
import PrivateRoute from './Helper/PrivateRoute';
import AllFiles from './SideBarComponents/AllFiles';
import AllFolders from './SideBarComponents/AllFolders';
import Favourites from './SideBarComponents/Favourites';
import Profile from './SideBarComponents/Profile';
import Leads from './SideBarComponents/Leads';

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/dashboard/*' element={<PrivateRoute><Dashboard /></PrivateRoute>}>
                    {/* Default route */}
                    <Route path='datas' element={<AllFiles />} />
                    <Route path='folders' element={<AllFolders />} />
                    <Route path='leads' element={<Leads />} />
                    <Route path='favourites' element={<Favourites />} />
                    <Route path='profile' element={<Profile />} />
                    {/* Redirect unknown paths */}
                    <Route path='*' element={<Navigate to="datas" replace />} />
                </Route>
                <Route path='/dataTable' element={<PrivateRoute><DataTable /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;