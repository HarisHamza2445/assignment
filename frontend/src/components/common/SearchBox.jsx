import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

function SearchBox({ value, placeholder, onSearch }) {
  const [text, setText] = useState(value);

  // keep the input in sync when the URL changes (back button, clear filters)
  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(text.trim());
  };

  return (
    <Form onSubmit={handleSubmit} className="search-box">
      <InputGroup>
        <Form.Control
          type="search"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          aria-label={placeholder}
        />
        <Button type="submit" className="btn-brand">
          Search
        </Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBox;
