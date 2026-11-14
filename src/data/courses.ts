import { providerBySlug } from "./providers";

export type Domain = "ai" | "cloud" | "security" | "data" | "webdev" | "devops" | "programming" | "cs" | "networking" | "marketing" | "career";
export type Level = "beginner" | "intermediate" | "advanced";
export type Cost = "free-cert" | "free-learn-paid-cert" | "free-learn-paid-exam" | "limited-time" | "free-no-cert";
export type Credential = "certificate" | "badge" | "exam" | "none";

export type Course = {
  id: string;
  title: string;
  provider: string;
  domain: Domain;
  level: Level;
  /** Approximate learning time in hours, only when the provider states it. */
  hours?: number;
  cost: Cost;
  credential: Credential;
  summary: string;
  url: string;
  trending?: boolean;
  /** Date (YYYY-MM-DD) the cost and credential were confirmed on the provider's page. */
  verified?: string;
};

export const domainLabels: Record<Domain, string> = {
  ai: "AI & ML", cloud: "Cloud", security: "Cybersecurity", data: "Data", webdev: "Web dev", devops: "DevOps & Linux",
  programming: "Programming", cs: "CS fundamentals", networking: "Networking", marketing: "Marketing", career: "Career skills",
};
export const levelLabels: Record<Level, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
export const costLabels: Record<Cost, string> = {
  "free-cert": "Free certificate",
  "free-learn-paid-cert": "Paid certificate",
  "free-learn-paid-exam": "Paid exam",
  "limited-time": "Limited-time free",
  "free-no-cert": "No certificate",
};
export const costExplain: Record<Cost, string> = {
  "free-cert": "Both the course and the certificate or badge are free.",
  "free-learn-paid-cert": "You can learn for free, but the certificate costs money (financial aid is sometimes available).",
  "free-learn-paid-exam": "The learning is free; the official certification exam has a fee.",
  "limited-time": "The certificate or exam is free only during a campaign. Check the dates on the provider's site.",
  "free-no-cert": "Free learning material without a certificate.",
};
export const credentialLabels: Record<Credential, string> = {
  certificate: "Certificate", badge: "Digital badge", exam: "Official exam", none: "No credential",
};

const V = "2026-11-14"; // checked on the provider's page on this date

type Row = Omit<Course, "url"> & { url: string };

// Every URL below is the provider's own page for that course, found on 2026-11-14.
// `verified` marks entries whose cost and credential were also read on that page.
// Entries without it come from the provider's catalog but their free status should be re-checked.
const rows: Row[] = [
  // ---------- Microsoft ----------
  { id: "ms-cloud-concepts", title: "Introduction to Cloud Infrastructure: Describe Cloud Concepts", provider: "microsoft", domain: "cloud", level: "beginner", cost: "free-learn-paid-exam", credential: "exam", summary: "Part of the AZ-900 Azure Fundamentals preparation: cloud models, benefits and service types.", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/", trending: true },
  { id: "ms-azure-governance", title: "Introduction to Cloud Infrastructure: Describe Azure Management and Governance", provider: "microsoft", domain: "cloud", level: "beginner", cost: "free-learn-paid-exam", credential: "exam", summary: "Cost management, governance, compliance and monitoring tools in Azure (AZ-900 prep).", url: "https://learn.microsoft.com/en-us/training/paths/describe-azure-management-governance/" },
  { id: "ms-ai-apps-agents", title: "Get started with AI applications and agents on Azure", provider: "microsoft", domain: "ai", level: "beginner", cost: "free-learn-paid-exam", credential: "exam", summary: "Build-up to the Azure AI Fundamentals certification: AI apps, agents and Azure AI services.", url: "https://learn.microsoft.com/en-us/training/paths/get-started-ai-apps-agents/", trending: true },
  { id: "ms-genai-module", title: "Introduction to generative AI and agents", provider: "microsoft", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "A short module on how generative AI and agents work; earns a Microsoft Learn badge.", url: "https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/" },
  { id: "ms-applied-csharp", title: "Applied Skills: Get started with classes, properties, and methods in C#", provider: "microsoft", domain: "programming", level: "beginner", cost: "free-cert", credential: "badge", summary: "A hands-on lab assessment that awards a free, verifiable Microsoft Applied Skills credential.", url: "https://learn.microsoft.com/en-us/credentials/applied-skills/get-started-with-classes-properties-and-methods-in-c-sharp/" },
  { id: "ms-applied-cloud-security", title: "Applied Skills: Get started with cloud security and monitoring tasks", provider: "microsoft", domain: "security", level: "intermediate", cost: "free-cert", credential: "badge", summary: "Prove hands-on cloud security skills in a lab and earn a free Applied Skills credential.", url: "https://learn.microsoft.com/en-us/credentials/applied-skills/get-started-with-cloud-security-and-monitoring-tasks/" },
  { id: "ms-applied-power-automate", title: "Applied Skills: Create and manage automated processes by using Power Automate", provider: "microsoft", domain: "career", level: "beginner", cost: "free-cert", credential: "badge", summary: "Automate business workflows with Power Automate and earn a free Applied Skills credential.", url: "https://learn.microsoft.com/en-us/credentials/applied-skills/create-and-manage-automated-processes-with-power-automate/" },
  { id: "ms-python-1", title: "Get Started with Python Programming: Part 1 - Fundamentals", provider: "microsoft", domain: "programming", level: "beginner", cost: "free-cert", credential: "badge", summary: "Python basics: variables, data types, control flow and functions, with a Learn trophy.", url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-python-fundamentals/" },
  { id: "ms-python-2", title: "Get Started with Python Programming: Part 2 - Building Programs", provider: "microsoft", domain: "programming", level: "beginner", cost: "free-cert", credential: "badge", summary: "Build complete Python programs with files, modules and error handling.", url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-python-programs/" },
  { id: "ms-github-foundations-2", title: "GitHub Foundations Part 2 of 2", provider: "microsoft", domain: "devops", level: "beginner", cost: "free-learn-paid-exam", credential: "exam", summary: "Collaboration, projects and security on GitHub; prepares for the GH-900 exam.", url: "https://learn.microsoft.com/en-us/training/paths/github-foundations-2/" },

  // ---------- Google ----------
  { id: "g-intro-genai", title: "Introduction to Generative AI", provider: "google", domain: "ai", level: "beginner", hours: 0.75, cost: "free-cert", credential: "badge", summary: "What generative AI is, how it works and how it differs from traditional ML; earn a badge.", url: "https://www.skills.google/course_templates/536", trending: true, verified: V },
  { id: "g-intro-llm", title: "Introduction to Large Language Models", provider: "google", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "How large language models work, prompt tuning and Google tools for building with LLMs.", url: "https://www.skills.google/course_templates/539" },
  { id: "g-responsible-ai", title: "Introduction to Responsible AI", provider: "google", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "Why responsible AI matters and how Google applies its AI principles.", url: "https://www.skills.google/course_templates/554" },
  { id: "g-vertex-studio", title: "Introduction to Vertex AI Studio", provider: "google", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "Prototype and test generative AI models with Vertex AI Studio.", url: "https://www.skills.google/course_templates/552" },
  { id: "g-genai-path", title: "Beginner: Introduction to Generative AI (learning path)", provider: "google", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "A full beginner path of short generative AI courses, each with a skill badge.", url: "https://www.skills.google/paths/118" },
  { id: "g-ads-skillshop", title: "Google Ads training and certifications (Skillshop)", provider: "google", domain: "marketing", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Free Google Ads courses and certification assessments on Skillshop.", url: "https://skillshop.withgoogle.com/googleads/" },

  // ---------- AWS ----------
  { id: "aws-ccp-essentials", title: "AWS Cloud Practitioner Essentials", provider: "aws", domain: "cloud", level: "beginner", hours: 12.75, cost: "free-learn-paid-exam", credential: "exam", summary: "AWS cloud basics, core services, security and pricing; prepares for the Cloud Practitioner exam.", url: "https://skillbuilder.aws/learn/94T2BEN85A/aws-cloud-practitioner-essentials/8D79F3AVR7", trending: true },
  { id: "aws-educate", title: "AWS Educate cloud courses and badges", provider: "aws", domain: "cloud", level: "beginner", cost: "free-cert", credential: "badge", summary: "No-cost self-paced cloud courses and labs for students, with AWS Educate digital badges.", url: "https://aws.amazon.com/education/awseducate/" },

  // ---------- IBM ----------
  { id: "ibm-ai-fundamentals", title: "Artificial Intelligence Fundamentals", provider: "ibm", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "AI concepts, NLP, computer vision and AI ethics, with an IBM digital credential.", url: "https://skillsbuild.org/college-students/course-catalog/artificial-intelligence-fundamentals", trending: true, verified: V },
  { id: "ibm-genai-action", title: "Generative AI in Action", provider: "ibm", domain: "ai", level: "beginner", cost: "free-cert", credential: "badge", summary: "Use generative AI tools at work and learn prompt techniques, with an IBM credential.", url: "https://skillsbuild.org/college-students/course-catalog/generative-ai-in-action" },
  { id: "ibm-data-fundamentals", title: "Data Fundamentals", provider: "ibm", domain: "data", level: "beginner", cost: "free-cert", credential: "badge", summary: "Data concepts, cleaning and visualization, with an IBM digital credential.", url: "https://skillsbuild.org/college-students/digital-credentials/data-fundamentals" },
  { id: "ibm-cyber-fluency", title: "Cybersecurity Fluency Pathway", provider: "ibm", domain: "security", level: "beginner", cost: "free-cert", credential: "badge", summary: "Threats, attacks and defenses for beginners, with an IBM digital credential.", url: "https://skillsbuild.org/college-students/course-catalog/cybersecurity-fluency-pathway" },
  { id: "ibm-vuln-mgmt", title: "Vulnerability Management", provider: "ibm", domain: "security", level: "intermediate", cost: "free-cert", credential: "badge", summary: "Find, assess and fix security vulnerabilities, with an IBM digital credential.", url: "https://skillsbuild.org/college-students/course-catalog/vulnerability-management" },

  // ---------- Cisco ----------
  { id: "cisco-intro-cyber", title: "Introduction to Cybersecurity", provider: "cisco", domain: "security", level: "beginner", cost: "free-cert", credential: "badge", summary: "Protect yourself online and explore cybersecurity careers.", url: "https://www.netacad.com/courses/introduction-to-cybersecurity", trending: true },
  { id: "cisco-networking-basics", title: "Networking Basics", provider: "cisco", domain: "networking", level: "beginner", cost: "free-cert", credential: "badge", summary: "How networks work, IP addressing and building a small network.", url: "https://www.netacad.com/courses/networking-basics?courseLang=en-US" },
  { id: "cisco-python-1", title: "Python Essentials 1", provider: "cisco", domain: "programming", level: "beginner", cost: "free-cert", credential: "badge", summary: "Python from scratch with no prior experience, aligned with the PCEP exam.", url: "https://www.netacad.com/courses/python-essentials-1" },

  // ---------- Oracle ----------
  { id: "oracle-oci-foundations", title: "Become an OCI Foundations Associate (2026)", provider: "oracle", domain: "cloud", level: "beginner", cost: "limited-time", credential: "exam", summary: "Free Oracle Cloud Infrastructure learning path; the foundations exam has been free in past campaigns.", url: "https://mylearn.oracle.com/ou/learning-path/become-an-oci-foundations-associate-2026/163541" },
  { id: "oracle-agentic-ai", title: "Become an Oracle Agentic AI Foundations Associate", provider: "oracle", domain: "ai", level: "beginner", cost: "limited-time", credential: "exam", summary: "Agentic AI concepts on Oracle Cloud; check whether the exam is currently free.", url: "https://mylearn.oracle.com/ou/learning-path/become-an-oracle-agentic-ai-foundations-associate-2026/163239" },

  // ---------- Salesforce ----------
  { id: "sf-dev-beginner", title: "Developer Beginner trail", provider: "salesforce", domain: "programming", level: "beginner", cost: "free-cert", credential: "badge", summary: "Data modeling, formulas, Apex and Lightning basics; earn Trailhead badges.", url: "https://trailhead.salesforce.com/content/learn/trails/force_com_dev_beginner" },
  { id: "sf-platform-basics", title: "Salesforce Platform Basics", provider: "salesforce", domain: "cloud", level: "beginner", cost: "free-cert", credential: "badge", summary: "Get to know the Salesforce platform and earn a Trailhead badge.", url: "https://trailhead.salesforce.com/content/learn/modules/starting_force_com" },
  { id: "sf-pd1-study", title: "Study for the Platform Developer I exam", provider: "salesforce", domain: "programming", level: "intermediate", cost: "free-learn-paid-exam", credential: "exam", summary: "Free Trailhead prep for the paid Platform Developer I certification.", url: "https://trailhead.salesforce.com/content/learn/trails/platform-developer-i-certification-study-guide" },

  // ---------- Meta ----------
  { id: "meta-marketing", title: "Start marketing with Meta technologies", provider: "meta", domain: "marketing", level: "beginner", cost: "free-no-cert", credential: "none", summary: "Free Blueprint path on advertising across Facebook and Instagram.", url: "https://certifications.facebookblueprint.com/student/path/211554-meta-marketing" },
  { id: "meta-dma", title: "Meta Certified Digital Marketing Associate prep", provider: "meta", domain: "marketing", level: "beginner", cost: "free-learn-paid-exam", credential: "exam", summary: "Free courses that prepare you for the paid Digital Marketing Associate exam.", url: "https://www.facebookblueprint.com/student/path/517001-get-certified-as-digital-marketing-associate" },

  // ---------- HubSpot ----------
  { id: "hs-inbound-marketing", title: "Inbound Marketing Certification", provider: "hubspot", domain: "marketing", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Attract customers with valuable content and tailored experiences.", url: "https://academy.hubspot.com/courses/inbound-marketing", trending: true },
  { id: "hs-content-marketing", title: "Content Marketing Certification", provider: "hubspot", domain: "marketing", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Plan, create and promote content that brings in customers.", url: "https://academy.hubspot.com/courses/content-marketing" },
  { id: "hs-inbound", title: "Inbound Certification", provider: "hubspot", domain: "marketing", level: "beginner", cost: "free-cert", credential: "certificate", summary: "The inbound methodology for marketing, sales and service.", url: "https://academy.hubspot.com/courses/inbound" },

  // ---------- Fortinet ----------
  { id: "ft-fcf", title: "Fortinet Certified Fundamentals in Cybersecurity", provider: "fortinet", domain: "security", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Complete Introduction to the Threat Landscape plus one intro course and their exams.", url: "https://training.fortinet.com/local/staticpage/view.php?page=fcf_cybersecurity", trending: true },

  // ---------- Databricks ----------
  { id: "db-genai-accreditation", title: "Generative AI Fundamentals Accreditation", provider: "databricks", domain: "ai", level: "beginner", hours: 0.4, cost: "free-cert", credential: "badge", summary: "A 20-minute assessment; score 80% to earn the Databricks Generative AI Fundamentals badge.", url: "https://www.databricks.com/training/catalog/generative-ai-fundamentals-accreditation-1811" },
  { id: "db-genai-course", title: "Generative AI Fundamentals", provider: "databricks", domain: "ai", level: "beginner", cost: "free-no-cert", credential: "none", summary: "Self-paced course on generative AI concepts and use cases, before the accreditation.", url: "https://www.databricks.com/training/catalog/generative-ai-fundamentals-1765" },

  // ---------- NVIDIA ----------
  { id: "nv-jetson", title: "Getting Started with AI on Jetson Nano", provider: "nvidia", domain: "ai", level: "beginner", hours: 8, cost: "free-cert", credential: "certificate", summary: "Build deep learning projects on Jetson Nano; certificate available.", url: "https://courses.nvidia.com/courses/course-v1:DLI+S-RX-02+V2/about", verified: V },
  { id: "nv-genai-explained", title: "Generative AI Explained", provider: "nvidia", domain: "ai", level: "beginner", hours: 2, cost: "free-no-cert", credential: "none", summary: "How generative AI works, what it can do and its challenges.", url: "https://courses.nvidia.com/courses/course-v1:DLI+S-FX-07+V1/", trending: true, verified: V },
  { id: "nv-rag-agents", title: "Building RAG Agents for LLMs", provider: "nvidia", domain: "ai", level: "intermediate", hours: 8, cost: "free-no-cert", credential: "none", summary: "Design retrieval-augmented generation agents that can reason over documents.", url: "https://courses.nvidia.com/courses/course-v1:DLI+S-FX-15+V1/", verified: V },
  { id: "nv-cuda", title: "An Even Easier Introduction to CUDA", provider: "nvidia", domain: "programming", level: "intermediate", hours: 1, cost: "free-no-cert", credential: "none", summary: "Write your first GPU-accelerated programs with CUDA C++.", url: "https://courses.nvidia.com/courses/course-v1:DLI+T-AC-01+V1/about", verified: V },
  { id: "nv-disaster-risk", title: "Disaster Risk Monitoring Using Satellite Imagery", provider: "nvidia", domain: "ai", level: "intermediate", hours: 8, cost: "free-cert", credential: "certificate", summary: "Train a deep learning model to detect floods from satellite images; certificate available.", url: "https://courses.nvidia.com/courses/course-v1:DLI+S-ES-01+V1/", verified: V },

  // ---------- Infosys / TCS ----------
  { id: "infy-springboard", title: "Infosys Springboard: Programming Fundamentals using Python", provider: "infosys", domain: "programming", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Python programming basics with an Infosys Springboard certificate. Search the course name after signing in.", url: "https://infyspringboard.onwingspan.com/" },
  { id: "tcs-career-edge", title: "Career Edge: Young Professional", provider: "tcs", domain: "career", level: "beginner", cost: "free-no-cert", credential: "none", summary: "A free 15-day career readiness course: communication, workplace and interview skills.", url: "https://www.tcsion.com/courses/career-edge-young-professional/", verified: V },

  // ---------- Linux Foundation ----------
  { id: "lf-intro-linux", title: "Introduction to Linux (LFS101)", provider: "linux-foundation", domain: "devops", level: "beginner", hours: 60, cost: "free-cert", credential: "badge", summary: "Linux from the command line and the desktop; free with a digital badge.", url: "https://training.linuxfoundation.org/training/introduction-to-linux/", verified: V },
  { id: "lf-intro-k8s", title: "Introduction to Kubernetes (LFS158)", provider: "linux-foundation", domain: "devops", level: "beginner", cost: "free-cert", credential: "badge", summary: "Kubernetes architecture, objects and deployment basics.", url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/", trending: true },

  // ---------- Coursera ----------
  { id: "coursera-ml", title: "Supervised Machine Learning: Regression and Classification", provider: "coursera", domain: "ai", level: "beginner", hours: 33, cost: "free-learn-paid-cert", credential: "certificate", summary: "Andrew Ng's famous ML course from DeepLearning.AI and Stanford Online.", url: "https://www.coursera.org/learn/machine-learning", trending: true, verified: V },
  { id: "coursera-ai-everyone", title: "AI for Everyone", provider: "coursera", domain: "ai", level: "beginner", cost: "free-learn-paid-cert", credential: "certificate", summary: "A non-technical introduction to what AI can and cannot do, by Andrew Ng.", url: "https://www.coursera.org/learn/ai-for-everyone" },
  { id: "coursera-genai-everyone", title: "Generative AI for Everyone", provider: "coursera", domain: "ai", level: "beginner", cost: "free-learn-paid-cert", credential: "certificate", summary: "How generative AI works and how to use it in work and life.", url: "https://www.coursera.org/learn/generative-ai-for-everyone" },
  { id: "coursera-deep-learning", title: "Deep Learning Specialization", provider: "coursera", domain: "ai", level: "intermediate", cost: "free-learn-paid-cert", credential: "certificate", summary: "Neural networks, CNNs, sequence models and more from DeepLearning.AI.", url: "https://www.coursera.org/specializations/deep-learning" },

  // ---------- edX ----------
  { id: "edx-cs50x", title: "CS50's Introduction to Computer Science", provider: "edx", domain: "cs", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Harvard's legendary intro to CS: C, Python, SQL and web. CS50 offers its own free certificate; the edX verified certificate is paid.", url: "https://cs50.harvard.edu/x/", trending: true },

  // ---------- Udemy ----------
  { id: "udemy-free-python", title: "Python for Absolute Beginners!", provider: "udemy", domain: "programming", level: "beginner", hours: 2.25, cost: "free-no-cert", credential: "none", summary: "A short Python starter for complete beginners. Free Udemy courses do not include a certificate.", url: "https://www.udemy.com/course/free-python/" },
  { id: "udemy-python-80", title: "Learn Python: Python in 80 Minutes for Beginners", provider: "udemy", domain: "programming", level: "beginner", cost: "free-no-cert", credential: "none", summary: "A quick tour of Python fundamentals in under 90 minutes.", url: "https://www.udemy.com/course/learn-python-in-80-minutes/" },

  // ---------- freeCodeCamp ----------
  { id: "fcc-rwd", title: "Responsive Web Design Certification", provider: "freecodecamp", domain: "webdev", level: "beginner", hours: 300, cost: "free-cert", credential: "certificate", summary: "HTML and CSS through hands-on projects.", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", trending: true },
  { id: "fcc-js", title: "JavaScript Algorithms and Data Structures Certification", provider: "freecodecamp", domain: "webdev", level: "beginner", hours: 300, cost: "free-cert", credential: "certificate", summary: "JavaScript fundamentals, algorithms and data structures.", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
  { id: "fcc-backend", title: "Back End Development and APIs Certification", provider: "freecodecamp", domain: "webdev", level: "intermediate", hours: 300, cost: "free-cert", credential: "certificate", summary: "Node.js, Express, MongoDB and building APIs.", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/" },
  { id: "fcc-relational-db", title: "Relational Database Certification", provider: "freecodecamp", domain: "data", level: "beginner", hours: 300, cost: "free-cert", credential: "certificate", summary: "SQL, PostgreSQL, Bash and Git through real projects.", url: "https://www.freecodecamp.org/learn/relational-database/" },
  { id: "fcc-data-analysis", title: "Data Analysis with Python Certification", provider: "freecodecamp", domain: "data", level: "intermediate", hours: 300, cost: "free-cert", credential: "certificate", summary: "NumPy, pandas, Matplotlib and Seaborn for data analysis.", url: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
  { id: "fcc-ml-python", title: "Machine Learning with Python Certification", provider: "freecodecamp", domain: "ai", level: "intermediate", hours: 300, cost: "free-cert", credential: "certificate", summary: "TensorFlow, neural networks and ML projects in Python.", url: "https://www.freecodecamp.org/learn/machine-learning-with-python/" },
  { id: "fcc-infosec", title: "Information Security Certification", provider: "freecodecamp", domain: "security", level: "intermediate", hours: 300, cost: "free-cert", credential: "certificate", summary: "Secure web apps with HelmetJS and build penetration testing tools in Python.", url: "https://www.freecodecamp.org/learn/information-security/" },

  // ---------- Kaggle ----------
  { id: "kg-python", title: "Python", provider: "kaggle", domain: "programming", level: "beginner", cost: "free-cert", credential: "certificate", summary: "The Python you need for data science, with a free Kaggle certificate.", url: "https://www.kaggle.com/learn/python" },
  { id: "kg-intro-ml", title: "Intro to Machine Learning", provider: "kaggle", domain: "ai", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Build and validate your first ML models, with a free certificate.", url: "https://www.kaggle.com/learn/intro-to-machine-learning", trending: true },
  { id: "kg-intermediate-ml", title: "Intermediate Machine Learning", provider: "kaggle", domain: "ai", level: "intermediate", cost: "free-cert", credential: "certificate", summary: "Missing values, pipelines, cross-validation and XGBoost.", url: "https://www.kaggle.com/learn/intermediate-machine-learning" },
  { id: "kg-sql", title: "Intro to SQL", provider: "kaggle", domain: "data", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Query real datasets with SQL and BigQuery.", url: "https://www.kaggle.com/learn/intro-to-sql" },

  // ---------- NPTEL / SWAYAM ----------
  { id: "nptel-pdsa-python", title: "Programming, Data Structures and Algorithms using Python", provider: "nptel", domain: "cs", level: "intermediate", cost: "free-learn-paid-exam", credential: "exam", summary: "Prof. Madhavan Mukund's popular course. Runs every year; enrol in the current run on NPTEL.", url: "https://onlinecourses.nptel.ac.in/noc22_cs26/preview" },
  { id: "nptel-data-science", title: "NPTEL Data Science courses (domain)", provider: "nptel", domain: "data", level: "intermediate", cost: "free-learn-paid-exam", credential: "exam", summary: "IIT data science courses grouped into an NPTEL domain certification.", url: "https://nptel.ac.in/domains/discipline/106?course=106_1" },
  { id: "swayam-software-testing", title: "Software Testing", provider: "swayam", domain: "cs", level: "intermediate", cost: "free-learn-paid-exam", credential: "exam", summary: "Testing techniques and tools from an IIT course on SWAYAM.", url: "https://swayam.gov.in/nd1_noc19_cs71/preview" },

  // ---------- Great Learning ----------
  { id: "gl-python-ds", title: "Data Science with Python", provider: "greatlearning", domain: "data", level: "beginner", hours: 17, cost: "free-learn-paid-cert", credential: "certificate", summary: "Python, pandas and visualization for data science. Learning is free; the certificate has a fee.", url: "https://www.mygreatlearning.com/academy/learn-for-free/courses/data-science-with-python", verified: V },
  { id: "gl-ml-python", title: "Machine Learning with Python", provider: "greatlearning", domain: "ai", level: "beginner", cost: "free-learn-paid-cert", credential: "certificate", summary: "Core ML algorithms in Python for beginners.", url: "https://www.mygreatlearning.com/academy/learn-for-free/courses/machine-learning-with-python" },

  // ---------- Simplilearn ----------
  { id: "sl-genai", title: "Generative AI for Beginners (SkillUp)", provider: "simplilearn", domain: "ai", level: "beginner", hours: 0.5, cost: "free-cert", credential: "certificate", summary: "A short, free introduction to generative AI with a completion certificate.", url: "https://www.simplilearn.com/free-generative-ai-course-skillup", verified: V },
  { id: "sl-ml-basics", title: "Machine Learning Basics (SkillUp)", provider: "simplilearn", domain: "ai", level: "beginner", cost: "free-cert", credential: "certificate", summary: "ML concepts and algorithms for beginners with a free certificate.", url: "https://www.simplilearn.com/learn-machine-learning-basics-skillup" },
  { id: "sl-data-analytics", title: "Data Analytics for Beginners (SkillUp)", provider: "simplilearn", domain: "data", level: "beginner", cost: "free-cert", credential: "certificate", summary: "Data analysis basics, tools and techniques with a free certificate.", url: "https://www.simplilearn.com/learn-data-analytics-for-beginners-skillup" },
  { id: "sl-frontend", title: "Front End Development (SkillUp)", provider: "simplilearn", domain: "webdev", level: "beginner", cost: "free-cert", credential: "certificate", summary: "HTML, CSS and JavaScript basics with a free certificate.", url: "https://www.simplilearn.com/front-end-developer-free-course-skillup" },
  { id: "sl-digital-marketing", title: "Digital Marketing Basics (SkillUp)", provider: "simplilearn", domain: "marketing", level: "beginner", cost: "free-cert", credential: "certificate", summary: "SEO, social media and online advertising basics with a free certificate.", url: "https://www.simplilearn.com/free-digital-marketing-basics-course-skillup" },
];

export const courses: Course[] = rows;
export const courseById = Object.fromEntries(courses.map((c) => [c.id, c])) as Record<string, Course>;

// sanity: every course must reference a known provider
for (const c of courses) {
  if (!providerBySlug[c.provider]) throw new Error(`Unknown provider ${c.provider} for ${c.id}`);
}
