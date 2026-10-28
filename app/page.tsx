import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      
      {/* Section Titre / Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Mon Portfolio DevSecOps
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Bienvenue sur mon espace. Retrouvez mes projets et n'hésitez pas à me laisser un message via le formulaire ci-dessous.
        </p>
      </div>

      {/* Section Formulaire de contact (Tâche 47) */}
      <div className="w-full max-w-2xl">
        <ContactForm />
      </div>

    </main>
  );
}
