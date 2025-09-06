import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Header from './components/Header'
import Home from './pages/Home'
import BookDetails from './pages/BookDetails'
import './App.css'

function App() {
  return (
    <div className="App">
      <Header />
      <Container fluid className="px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:id" element={<BookDetails />} />
        </Routes>
      </Container>
    </div>
  )
}

export default App



