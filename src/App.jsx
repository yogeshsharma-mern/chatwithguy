import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from './pages/HomePage';
import { Route, Routes } from 'react-router-dom';
import Regsiter from './pages/Regsiter';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { Toaster } from "react-hot-toast";
  const queryClient = new QueryClient();
const App = () => {

  return (

    <QueryClientProvider client={queryClient}>
      <Toaster />

      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/register" element={<Regsiter/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/chat" element={<Chat/>}/>


      </Routes>
    </QueryClientProvider>

  )
}

export default App