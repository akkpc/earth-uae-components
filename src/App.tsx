import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Comparison_Table_POC } from './components/Comparison_Table_POC';
import { RouterProvider, createBrowserRouter } from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/compare",
    element: <Comparison_Table_POC />
  },
  {
    path: "/",
    element: <Comparison_Table_POC />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
