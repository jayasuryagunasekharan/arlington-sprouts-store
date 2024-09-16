import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import './index.css';
import SproutsBackground from './components/SproutsBackground';

const supabaseUrl = 'https://ixprazuojfgnwgwohpsn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cHJhenVvamZnbndnd29ocHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTAxMzYsImV4cCI6MjA0MjA4NjEzNn0._BJS5Q8E6zmpDJ3sCy_AjviKr28V31UzriA0Gvd7QTk'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
  const [sprouts, setSprouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSprout, setNewSprout] = useState({ name: '', quantity: 0, price: 0 });
  const [editingSprout, setEditingSprout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSprouts();
  }, []);

  useEffect(() => {
    console.log('Sprouts state updated:', sprouts);
  }, [sprouts]);

  async function fetchSprouts() {
    setLoading(true);
    // console.log('Fetching sprouts...');
    const { data, error } = await supabase
      .from('sprouts')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching sprouts:', error);
    } else {
      console.log('Fetched sprouts:', data);
      setSprouts(data || []);
    }
    setLoading(false);
  }

  async function addSprout() {
    const newId = Date.now(); // Generate a unique ID based on timestamp
    const sproutWithId = { ...newSprout, id: newId };

    const { data, error } = await supabase
      .from('sprouts')
      .insert([sproutWithId]);

    if (error) {
      console.error('Error adding sprout:', error);
    } else {
      console.log('Added sprout:', data);
      fetchSprouts();
      setNewSprout({ name: '', quantity: 0, price: 0 });
    }
  }

  async function updateSprout(id) {
    const { error } = await supabase
      .from('sprouts')
      .update(editingSprout)
      .eq('id', id);

    if (error) {
      console.error('Error updating sprout:', error);
    } else {
      console.log('Updated sprout:', editingSprout);
      fetchSprouts();
      setEditingSprout(null);
    }
  }

  async function deleteSprout(id) {
    const { error } = await supabase
      .from('sprouts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sprout:', error);
    } else {
      console.log('Deleted sprout with id:', id);
      fetchSprouts();
    }
  }

  const indexOfLastSprout = currentPage * itemsPerPage;
  const indexOfFirstSprout = indexOfLastSprout - itemsPerPage;
  const currentSprouts = sprouts.slice(indexOfFirstSprout, indexOfLastSprout);
  const totalPages = Math.ceil(sprouts.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <>
      <SproutsBackground />
      <div className="min-h-screen bg-transparent flex flex-col items-center py-10 relative z-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Sprouts Inventory</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Sprout</h2>
          <input
            type="text"
            placeholder="Name"
            value={newSprout.name}
            onChange={(e) => setNewSprout({ ...newSprout, name: e.target.value })}
            className="border rounded px-4 py-2 mr-2"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newSprout.quantity}
            onChange={(e) => setNewSprout({ ...newSprout, quantity: parseInt(e.target.value) })}
            className="border rounded px-4 py-2 mr-2"
          />
          <input
            type="number"
            placeholder="Price"
            value={newSprout.price}
            onChange={(e) => setNewSprout({ ...newSprout, price: parseFloat(e.target.value) })}
            className="border rounded px-4 py-2 mr-2"
          />
          <button
            onClick={addSprout}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Sprout
          </button>
        </div>

        {loading ? (
          <p className="text-lg text-gray-600">Loading sprouts...</p>
        ) : sprouts.length === 0 ? (
          <p className="text-lg text-gray-600">No sprouts found in the inventory.</p>
        ) : (
          <div className="overflow-x-auto w-full max-w-4xl">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">ID</th>
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                  <th className="py-3 px-4 text-left font-semibold">Price</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSprouts.map((sprout) => (
                  <tr key={sprout.id} className="border-t">
                    {editingSprout && editingSprout.id === sprout.id ? (
                      <>
                        <td className="py-3 px-4 border-b border-gray-200">{sprout.id}</td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <input
                            type="text"
                            value={editingSprout.name}
                            onChange={(e) => setEditingSprout({ ...editingSprout, name: e.target.value })}
                            className="border rounded px-4 py-2"
                          />
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <input
                            type="number"
                            value={editingSprout.quantity}
                            onChange={(e) => setEditingSprout({ ...editingSprout, quantity: parseInt(e.target.value) })}
                            className="border rounded px-4 py-2"
                          />
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <input
                            type="number"
                            value={editingSprout.price}
                            onChange={(e) => setEditingSprout({ ...editingSprout, price: parseFloat(e.target.value) })}
                            className="border rounded px-4 py-2"
                          />
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <button
                            onClick={() => updateSprout(sprout.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSprout(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 border-b border-gray-200">{sprout.id}</td>
                        <td className="py-3 px-4 border-b border-gray-200">{sprout.name}</td>
                        <td className="py-3 px-4 border-b border-gray-200">{sprout.quantity}</td>
                        <td className="py-3 px-4 border-b border-gray-200">${sprout.price.toFixed(2)}</td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <button
                            onClick={() => setEditingSprout(sprout)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSprout(sprout.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4 flex justify-between items-center">
              <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
