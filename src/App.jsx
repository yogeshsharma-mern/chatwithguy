import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from './pages/HomePage';
import { Route, Routes } from 'react-router-dom';
import Regsiter from './pages/Regsiter';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { Toaster } from "react-hot-toast";
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
const queryClient = new QueryClient();
const App = () => {

  return (

    <QueryClientProvider client={queryClient}>
      <Toaster />

      <Routes>
            <Route path="/" element={<HomePage />} />
        <Route element={<PublicRoute />}>


      
          <Route path="/register" element={<Regsiter />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

      </Routes>
    </QueryClientProvider>

  )
}

export default App