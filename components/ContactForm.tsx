'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ nom: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      // Appel à notre API Express (Tâche 47)
      const response = await fetch('http://192.168.78.128:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFeedback('Message envoyé avec succès !');
        setFormData({ nom: '', email: '', message: '' }); // Réinitialiser
      } else {
        setStatus('error');
        // Afficher les erreurs de validation de Zod (Tâche 48)
        setFeedback(data.details ? data.details.join(', ') : data.error);
      }
    } catch (error) {
      setStatus('error');
      setFeedback('Erreur de connexion au serveur.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-gray-900/50 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-2">Contactez-moi</h2>
      
      <input
        type="text"
        name="nom"
        placeholder="Votre nom"
        value={formData.nom}
        onChange={handleChange}
        required
        className="p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none"
      />
      
      <input
        type="email"
        name="email"
        placeholder="Votre email"
        value={formData.email}
        onChange={handleChange}
        required
        className="p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none"
      />
      
      <textarea
        name="message"
        placeholder="Votre message (10 caractères min)"
        value={formData.message}
        onChange={handleChange}
        required
        rows={4}
        className="p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none resize-none"
      />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>

      {status === 'success' && (
        <p className="text-green-400 text-sm mt-2 text-center">{feedback}</p>
      )}
      
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2 text-center">{feedback}</p>
      )}
    </form>
  );
}
