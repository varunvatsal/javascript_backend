import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(()=>{
    axios.get('http://localhost:4000/api/jokes')
    .then((res)=>{
      setJokes(res.data)
    }).catch((err)=>{
      console.log(error)
    })
  },[])

  return (
    <>
      <h1>hello brother</h1>
      <p>JOKES: {jokes.length}</p>
      {
        jokes.map((joke) => {
          <div key={joke.id}>
            <h3>{joke.title}</h3>
            <p>{joke.content}</p>
          </div>
        } )
      }
    </>
  )
}

export default App
