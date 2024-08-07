'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        router.push('/signin');
        return;
      }

      if (!user) {
        router.push('/signin');
        return;
      }

      await fetchTodos();
      setLoading(false);
    };

    checkAuth();
  });

  const fetchTodos = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return;
    }

    if (!user) {
      router.push('/signin');
      return;
    }

    // fetch todos
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id);

    console.log('Fetched todos:', todos);

    if (error) {
      console.error(error);
    } else {
      setTodos(todos);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('todos')
      .insert([{ task: newTodo, due_date: dueDate, user_id: user.id, user_email: user.email }]);

    if (error) {
      console.error(error);
    } else {
      setNewTodo('');
      setDueDate('');
      fetchTodos(); // Fetch todos again to update the state
    }
  };

  const deleteTodo = async (id) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
    } else {
      fetchTodos(); // Fetch todos again to update the state
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      router.push('/signin');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Your Todos</h2>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
        <form onSubmit={addTodo} className="flex flex-col mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-4 focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-4 focus:outline-none focus:shadow-outline"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add
          </button>
        </form>
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-gray-200 p-4 rounded-lg shadow"
            >
              <div>
                <span className="text-gray-800">{todo.task}</span>
                {todo.due_date && (
                  <div className="text-gray-500 text-sm">
                    Due: {new Date(todo.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Todos;
