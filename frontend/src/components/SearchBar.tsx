import React, { useState } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { Search, X } from 'react-bootstrap-icons'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search books by title...",
  className = ""
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Auto-search as user types (with debounce)
    if (value.trim() === '') {
      onSearch('')
    }
  }

  return (
    <Form onSubmit={handleSubmit} className={className}>
      <InputGroup className="search-bar">
        <InputGroup.Text>
          <Search />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="border-end-0"
        />
        {query && (
          <Button
            variant="outline-secondary"
            onClick={handleClear}
            className="border-start-0"
          >
            <X />
          </Button>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </InputGroup>
    </Form>
  )
}

export default SearchBar

