import { RouterProvider, createBrowserRouter } from "react-router-dom";
import './App.css';
import { Comparison_Table_POC } from './components/Comparison_Table_POC';

const router = createBrowserRouter([
  {
    path: "/compare",
    element: <Comparison_Table_POC />
  },
  {
    path: "/",
    element: <div>Hello</div>
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
