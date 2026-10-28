import { projects } from "@/data/projects";
import ProjectCard from "@/components/shared/ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-8">Projets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
