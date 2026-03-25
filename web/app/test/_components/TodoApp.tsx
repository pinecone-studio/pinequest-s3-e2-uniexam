import { useEffect, useState } from "react";
import { Todo } from "../../types/Todo";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import { loadTodos, saveTodos } from "../../utils/localStorage";

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // load from localStorage
  useEffect(() => {
    const stored = loadTodos();
    setTodos(stored);
  }, []);

  // save to localStorage
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
};

export default TodoApp;