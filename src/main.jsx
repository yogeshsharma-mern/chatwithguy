import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from "./redux/store.js";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>

<BrowserRouter>


    {/* <StrictMode> */}
      <App />
    {/* </StrictMode> */}
</BrowserRouter>

  </Provider>
)
