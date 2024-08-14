import React from 'react'
import Navbar from '../Navbar'

const Likes = ({handleLogout}) => {
  return (
    <>
    <Navbar handleLogout={handleLogout}/>
    <div>Likes</div>
    </>
  )
}

export default Likes