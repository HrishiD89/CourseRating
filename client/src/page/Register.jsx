import React, { useEffect, useState } from 'react'
import { Link , useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {

const [name,setName] = useState('');
const [email,setEmail] = useState('');
const [password,setPassword] = useState('');

const navigate = useNavigate();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

useEffect(()=>{
    localStorage.removeItem("token");
},[])

const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
        name,email,password
    }

    try{
    const res = await axios.post(`${BACKEND_URL}/auth/register`,user);
    if(res.data.token){
        localStorage.setItem("token",res.data.token);
        setTimeout(()=>{
            navigate('/courses')
        },3000)
    }

    handleClear();

    }catch(error){
        console.log(error);
    }
}

const handleClear = () => {
    setName('');
    setEmail('');
    setPassword('');
}

  return (
    <div>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder='Name' onChange={(e)=> setName(e.target.value)} />
            <input type="email" placeholder='Email' onChange={(e)=> setEmail(e.target.value)}/>
            <input type="password" placeholder='Password'onChange={(e)=> setPassword(e.target.value)}/>
            <button type='submit'>Register</button>
        </form>
    </div>
  )
}

export default Register