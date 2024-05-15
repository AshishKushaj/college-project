import React, { useEffect, useState } from 'react';
import { useLocation,  useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Notification from './Notification';

export default function Header() {

  const navigate=useNavigate();
  const location = useLocation();
  const auth= getAuth()
  const [pageState,setPageState]=useState("Sign In")

  useEffect(()=>{
    onAuthStateChanged(auth,(user)=>{
      if(user){
        setPageState("Profile")
      }else{
        setPageState("Sign In")
      }
    })
  },[auth])

  function onRoute(route) {
    return route === location.pathname;
  }

  return (
    <div className='sticky top-0 z-40 bg-white border-b shadow-sm'>
      <header className='flex justify-between items-center px-3 max-w-6xl mx-auto'>
        <div>
          <img src='https://collegeconnect.ie/wp-content/themes/html5blank-stable/img/logo.png' alt='logo' className='h-8 cursor-pointer' onClick={()=> navigate("/")} />
        </div>

        <div>
          <ul className='flex space-x-10'>

            <li  onClick={()=>navigate("/")} 
              className={`cursor-pointer py-3 text-sm font-semibold text-black  border-b-[3px] ${onRoute("/") ? 'border-b-red-500 transition ease-in-out duration-500 text-black' : 'border-b-transparent text-gray-400'}`}>Home</li>

            <li onClick={()=>navigate("/offers")} 
              className={`cursor-pointer py-3 text-sm font-semibold text-black border-b-[3px]  ${onRoute("/offers") ? 'border-b-red-500 transition ease-in-out duration-500 text-black ' : 'border-b-transparent text-gray-400'}`}>Contests</li>

            <li onClick={() => navigate("/Webinars")}
              className={`cursor-pointer py-3 text-sm font-semibold text-black border-b-[3px]  ${onRoute("/Webinars") ? 'border-b-red-500 transition ease-in-out duration-500 text-black ' : 'border-b-transparent text-gray-400'}`}>Webinars</li>

            <li onClick={()=>navigate("/profile")} 
              className={`cursor-pointer transition ease-in-out duration-500 py-3 text-sm font-semibold text-black border-b-[3px]  ${(onRoute("/sign-in") || onRoute("/profile")) ? 'border-b-red-500 text-black' : 'border-b-transparent text-gray-400'}`}> {pageState} </li>

            <li> <Notification
            /> </li>

          </ul>
        </div>
      </header>
    </div>
  );
}
