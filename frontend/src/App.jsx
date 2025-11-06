import React from 'react'
import Navbar from './components/navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home'
import ArticleList from "./components/articleList/ArticleList";
import ArticleDetail from "./components/articledetail/ArticleDetail";

import Tech from './pages/tech/Tech';
import Sports from './pages/sports/Sports';
import Politics from './pages/politics/Politics';
import Entertainment from './pages/entertainment/Entertainment';
import Loginpopup from './loginpopup/Loginpopup';
import { useContext } from 'react';
import { StoreContext } from './context/Storecontext';
const App = () => {
  const {showlogin}=useContext(StoreContext)
  return (
    <div className='app'>
      {showlogin?<Loginpopup/>:<></>}
      <Navbar></Navbar>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path="/tech" element={<Tech/>} />
        <Route path="/sports" element={<Sports/>} />
        <Route path="/politics" element={<Politics />} />
        <Route path="/entertainment" element={<Entertainment />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
      </Routes>
    
    </div>
  )
}

export default App
