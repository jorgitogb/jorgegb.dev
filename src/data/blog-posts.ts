export type BlogPost = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  content: string
}

export const posts: BlogPost[] = [
  {
    slug: "implementing-fair-data-principles",
    title: "Implementing FAIR Data Principles in Research Pipelines",
    date: "2026-05-20",
    description:
      "A practical guide to making research data Findable, Accessible, Interoperable, and Reusable using modern tooling and metadata standards.",
    tags: ["#FAIR", "#data", "#reproducibility"],
    content:
      "FAIR data principles have become the cornerstone of modern scientific data management. In this post, I walk through a practical implementation of FAIR principles in a computational biology pipeline, covering metadata annotation with Schema.org vocabularies, persistent identifier assignment through ORCID and DataCite, and repository selection for data deposition.\n\nKey to the implementation is the adoption of machine-actionable metadata — using structured formats like JSON-LD instead of free-text README files. I demonstrate how to integrate FAIR assessment tools like F-UJI directly into CI/CD pipelines, ensuring every release meets baseline FAIR metrics before publication.",
  },
  {
    slug: "reproducible-workflows-with-containers",
    title: "Building Reproducible Computational Workflows with Containers",
    date: "2026-04-15",
    description:
      "How containerisation and workflow managers like Nextflow ensure computational reproducibility across HPC and cloud environments.",
    tags: ["#docker", "#workflows", "#openscience"],
    content:
      "Reproducibility in computational research remains a significant challenge. This post explores how containerisation technologies — Docker and Singularity — combined with workflow managers like Nextflow and Snakemake, provide a robust foundation for reproducible research pipelines.\n\nI cover the complete lifecycle: from containerising individual tools with version-pinned dependencies, to orchestrating multi-step workflows that scale from a laptop to an HPC cluster. A real-world example walks through a RNA-seq differential expression pipeline that runs identically across three different computing environments.",
  },
  {
    slug: "open-science-infrastructure",
    title: "Why Open Science Infrastructure Matters for the Next Decade",
    date: "2026-03-01",
    description:
      "Reflections on the evolving landscape of open science tools, repositories, and community-governed infrastructure that will shape research in the coming years.",
    tags: ["#openscience", "#infrastructure", "#policy"],
    content:
      "Open science infrastructure — from preprint servers and open repositories to community-maintained software libraries — forms the backbone of modern research. In this post, I argue that the next decade will be defined not by individual open access policies but by the robustness and interoperability of the underlying infrastructure.\n\nI examine key trends: the rise of Research Data Alliances and their role in standardising metadata, the shift toward federated identity systems for跨-institutional collaboration, and the growing importance of sustainable funding models for critical but under-resourced projects like software libraries and knowledge bases.",
  },
]
