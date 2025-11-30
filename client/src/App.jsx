import {Routes,Route} from "react-router-dom";
import Layout from "./page/Layout";
import Courses from "./page/Courses";
import About from "./page/About";
import Login from "./page/Login";
import Register from "./page/Register";

function App() {

  return (
    <Routes>
      <Route path="/" element = {<Layout/>}>
        <Route index element = {<Login/>}/>
        <Route path="register" element = {<Register/>} />
        <Route path="/courses" element = {<Courses/>}/>
        <Route path="/about" element = {<About/>}/>
      </Route>
    </Routes>
  )
}

export default App
