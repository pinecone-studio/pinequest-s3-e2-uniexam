import React, { useState } from "react";

interface Props {
  addTodo: (text: string) => void;
}

const TodoInput: React.FC<Props> = ({ addTodo }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Todo бич..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Нэмэх</button>
    </form>
  );
};

export default TodoInput;