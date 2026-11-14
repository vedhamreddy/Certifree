import { courseById, type Domain } from "./courses";

/** Career paths: an ordered list of courses from the catalog, from first steps to job-ready. */
export type PathStep = { courseId: string; why: string };
export type CareerPath = { slug: string; title: string; domain: Domain; blurb: string; steps: PathStep[] };

export const careerPaths: CareerPath[] = [
  {
    slug: "cloud-engineer", title: "Cloud engineer", domain: "cloud",
    blurb: "Linux and networking basics, then cloud concepts on Azure, AWS and Oracle, then containers.",
    steps: [
      { courseId: "lf-intro-linux", why: "Every cloud server runs Linux. Get comfortable with the command line first." },
      { courseId: "cisco-networking-basics", why: "IP addresses, subnets and routing come up in every cloud setup." },
      { courseId: "ms-cloud-concepts", why: "The core ideas: IaaS, PaaS, SaaS, regions and pricing." },
      { courseId: "aws-ccp-essentials", why: "The most widely used cloud. Prepares you for the Cloud Practitioner exam." },
      { courseId: "ms-azure-governance", why: "How companies control cost, access and policy in the cloud." },
      { courseId: "oracle-oci-foundations", why: "A second cloud to compare, with a free Foundations path." },
      { courseId: "lf-intro-k8s", why: "Kubernetes runs most modern cloud apps." },
      { courseId: "lf-lfs162", why: "DevOps and SRE: how teams ship and run reliable services." },
    ],
  },
  {
    slug: "data-analyst", title: "Data analyst", domain: "data",
    blurb: "Data basics, Python and SQL, then real analysis projects.",
    steps: [
      { courseId: "ibm-data-fundamentals", why: "What data work looks like, with a free IBM credential." },
      { courseId: "kg-python", why: "The Python you need for data, in short hands-on lessons." },
      { courseId: "kg-pandas", why: "pandas is how analysts load, filter and summarise data in Python." },
      { courseId: "kg-data-cleaning", why: "Real data is messy. Cleaning it is most of the job." },
      { courseId: "kg-sql", why: "SQL is the most asked-for skill in analyst job posts." },
      { courseId: "kg-data-visualization", why: "Turn findings into clear charts people understand." },
      { courseId: "sl-data-analytics", why: "Analysis steps, tools and charts, with a free certificate." },
      { courseId: "fcc-data-analysis", why: "Five real projects with NumPy and pandas for your portfolio." },
    ],
  },
  {
    slug: "web-developer", title: "Web developer", domain: "webdev",
    blurb: "HTML and CSS, JavaScript, then the back end, databases and GitHub.",
    steps: [
      { courseId: "fcc-rwd", why: "Build real pages with HTML and CSS that work on phones." },
      { courseId: "fcc-js", why: "JavaScript makes pages interactive. It's the core of web work." },
      { courseId: "sl-frontend", why: "Ties HTML, CSS and JavaScript together, with a free certificate." },
      { courseId: "fcc-relational-db", why: "Databases and Git, which every web app needs." },
      { courseId: "fcc-backend", why: "Build APIs and servers with Node.js and Express." },
      { courseId: "ms-github-foundations-2", why: "Collaborate like a team: pull requests, projects and security." },
    ],
  },
  {
    slug: "cybersecurity", title: "Cybersecurity analyst", domain: "security",
    blurb: "Networking first, then threats and defenses, then hands-on cloud security.",
    steps: [
      { courseId: "cisco-networking-basics", why: "You can't protect a network you don't understand." },
      { courseId: "cisco-intro-cyber", why: "A broad look at threats, attacks and security careers." },
      { courseId: "ibm-cyber-fluency", why: "Core security ideas, with a free IBM credential." },
      { courseId: "ms-applied-cloud-security", why: "A hands-on lab that earns a free Microsoft credential." },
      { courseId: "ibm-vuln-mgmt", why: "Find, rate and fix vulnerabilities, a common entry-level task." },
      { courseId: "lf-skf100", why: "The OWASP Top 10: the web attacks every security team watches for." },
      { courseId: "cisco-ethical-hacker", why: "Think like an attacker: plan and run penetration tests." },
    ],
  },
  {
    slug: "ai-ml-engineer", title: "AI / ML engineer", domain: "ai",
    blurb: "Python, AI basics and generative AI, then machine learning and building with LLMs.",
    steps: [
      { courseId: "ms-python-1", why: "Python is the language of AI. Start with the fundamentals." },
      { courseId: "g-intro-genai", why: "A short first look at how generative AI works." },
      { courseId: "ibm-ai-fundamentals", why: "Core AI topics and responsible AI, with a free credential." },
      { courseId: "kg-intro-ml", why: "Build and test your first machine learning models." },
      { courseId: "coursera-ml", why: "The classic, deeper course on how ML models actually learn." },
      { courseId: "kg-intermediate-ml", why: "Pipelines, cross-validation and XGBoost for real datasets." },
      { courseId: "kg-intro-to-deep-learning", why: "Neural networks with TensorFlow and Keras." },
      { courseId: "nv-rag-agents", why: "Build apps on large language models with retrieval and agents." },
    ],
  },
];

export const pathBySlug = Object.fromEntries(careerPaths.map((p) => [p.slug, p])) as Record<string, CareerPath>;

for (const p of careerPaths) for (const s of p.steps) if (!courseById[s.courseId]) throw new Error(`Path ${p.slug}: unknown course ${s.courseId}`);
