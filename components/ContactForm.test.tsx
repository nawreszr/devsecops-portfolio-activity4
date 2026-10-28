import { render, screen } from '@testing-library/react';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  it('affiche le formulaire de contact avec les bons champs', () => {
    render(<ContactForm />);
    expect(screen.getByText('Contactez-moi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Votre nom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Votre email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Votre message (10 caractères min)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer le message/i })).toBeInTheDocument();
  });
});
