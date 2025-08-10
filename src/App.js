import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Plus, ClipboardList, AlertTriangle } from 'lucide-react';

const VoiceInventoryApp = () => {
  // State management
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Syringes', quantity: 25, unit: 'pieces', lowStock: 10, lastUpdated: new Date() },
    { id: 2, name: 'Bandages', quantity: 15, unit: 'rolls', lowStock: 5, lastUpdated: new Date() },
    { id: 3, name: 'Lidocaine', quantity: 8, unit: 'vials', lowStock: 3, lastUpdated: new Date() },
    { id: 4, name: 'Gloves', quantity: 50, unit: 'pairs', lowStock: 20, lastUpdated: new Date() },
    { id: 5, name: 'Gauze', quantity: 12, unit: 'packs', lowStock: 5, lastUpdated: new Date() }
  ]);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Your voice command will appear here...');
  const [status, setStatus] = useState('Click the button and speak your inventory update');
  const [updatedItemId, setUpdatedItemId] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('Listening... Speak your command');
        setTranscript('Listening for your voice command...');
      };

      recognition.onresult = (event) => {
        const voiceTranscript = event.results[0][0].transcript;
        setTranscript(`You said: "${voiceTranscript}"`);
        processVoiceCommand(voiceTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatus('Click the button and speak your inventory update');
      };

      recognition.onerror = (event) => {
        setStatus(`Error: ${event.error}`);
        setTranscript('Error occurred. Please try again.');
        setIsListening(false);
      };
    } else {
      setStatus('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Process voice commands
  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    const patterns = [
      /(?:i\s+)?used\s+(\d+)\s+(.+)/i,
      /remove\s+(\d+)\s+(.+)/i,
      /add\s+(\d+)\s+(.+?)(?:\s+to\s+inventory)?/i,
      /(\d+)\s+(.+?)\s+used/i
    ];

    let matched = false;
    
    for (const pattern of patterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        const quantity = parseInt(match[1]);
        const itemName = match[2].trim();
        const isAdding = /add/i.test(lowerCommand);
        
        updateInventory(itemName, quantity, isAdding);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      setStatus('Could not understand command. Try: "I used 5 syringes" or "Add 10 gloves"');
    }
  };

  // Update inventory
  const updateInventory = (itemName, quantity, isAdding = false) => {
    const item = inventory.find(inv => 
      inv.name.toLowerCase().includes(itemName) || 
      itemName.includes(inv.name.toLowerCase())
    );
    
    if (item) {
      setInventory(prevInventory => 
        prevInventory.map(inv => 
          inv.id === item.id 
            ? {
                ...inv,
                quantity: isAdding ? inv.quantity + quantity : Math.max(0, inv.quantity - quantity),
                lastUpdated: new Date()
              }
            : inv
        )
      );

      const action = isAdding ? 'Added' : 'Used';
      const newQuantity = isAdding ? item.quantity + quantity : Math.max(0, item.quantity - quantity);
      setStatus(`✅ ${action} ${quantity} ${item.name}. Stock: ${item.quantity} → ${newQuantity}`);
      
      // Highlight updated item
      setUpdatedItemId(item.id);
      setTimeout(() => setUpdatedItemId(null), 2000);
    } else {
      const availableItems = inventory.map(i => i.name).join(', ');
      setStatus(`❌ Item "${itemName}" not found. Available items: ${availableItems}`);
    }
  };

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Add sample item
  const addSampleItem = () => {
    const newItem = {
      id: Math.max(...inventory.map(i => i.id)) + 1,
      name: `Sample Item ${inventory.length + 1}`,
      quantity: 20,
      unit: 'pieces',
      lowStock: 5,
      lastUpdated: new Date()
    };
    setInventory([...inventory, newItem]);
  };

  // UI components
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <ClipboardList size={58} />
            <h1 className="text-6xl font-bold">Inventory Assistant</h1>
          </div>
        </div>

        {/* Voice Section */}
        <div className="bg-slate-50 p-8 border-b border-gray-200">
          <div className="text-center">
            <button
              onClick={toggleVoiceRecognition}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-green-500 hover:bg-green-600 text-white hover:-translate-y-1'
              }`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              {isListening ? 'Stop Listening' : 'Start Voice Command'}
            </button>

            <div className="mt-6 text-lg text-gray-600">{status}</div>

            <div className="mt-4 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-800 text-lg min-h-[80px] flex items-center justify-center">
              {transcript}
            </div>

            {/* Examples */}
            <div className="mt-6 p-6 bg-cyan-50 rounded-xl">
              <h3 className="text-lg font-semibold text-cyan-800 mb-4">Try saying:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-cyan-700">
                <div className="flex items-center gap-2">
                  <Mic size={16} />
                  <span>"I used 5 syringes"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic size={16} />
                  <span>"Remove 3 bandages"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic size={16} />
                  <span>"Used 2 vials of lidocaine"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic size={16} />
                  <span>"Add 10 gloves to inventory"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ClipboardList size={32} className="text-gray-700" />
              <h2 className="text-3xl font-bold text-gray-800">Current Inventory</h2>
            </div>
            <button
              onClick={addSampleItem}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left p-6 font-semibold text-gray-700">Item Name</th>
                  <th className="text-left p-6 font-semibold text-gray-700">Current Stock</th>
                  <th className="text-left p-6 font-semibold text-gray-700">Unit</th>
                  <th className="text-left p-6 font-semibold text-gray-700">Low Stock Alert</th>
                  <th className="text-left p-6 font-semibold text-gray-700">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      updatedItemId === item.id ? 'bg-yellow-100' : ''
                    }`}
                  >
                    <td className="p-6 font-medium text-gray-900">{item.name}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xl font-bold ${
                            item.quantity <= item.lowStock ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {item.quantity <= item.lowStock && (
                          <AlertTriangle size={20} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-gray-600">{item.unit}</td>
                    <td className="p-6 text-gray-600">{item.lowStock}</td>
                    <td className="p-6 text-gray-600">
                      {item.lastUpdated.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low Stock Alerts */}
          {inventory.filter(item => item.quantity <= item.lowStock).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                <AlertTriangle size={20} />
                Low Stock Alerts
              </div>
              <div className="text-red-700">
                {inventory
                  .filter(item => item.quantity <= item.lowStock)
                  .map(item => `${item.name} (${item.quantity} ${item.unit})`)
                  .join(', ')} need restocking
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInventoryApp;