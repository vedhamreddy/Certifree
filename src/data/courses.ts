import { companyBySlug } from "./companies";

export type Domain = "ai" | "cloud" | "security" | "data" | "webdev" | "devops" | "programming" | "networking" | "marketing" | "career";
export type Level = "beginner" | "intermediate" | "advanced";
export type Cost = "free-cert" | "free-learn-paid-cert" | "free-learn-paid-exam" | "limited-time" | "free-no-cert";
export type Credential = "certificate" | "badge" | "exam" | "none";

export type Course = {
  id: string;
  title: string;
  company: string;
  domain: Domain;
  level: Level;
  hours: number;
  cost: Cost;
  credential: Credential;
  summary: string;
  url: string;
  trending?: boolean;
  lastVerified?: string;
};

export const domainLabels: Record<Domain, string> = {
  ai: "AI & ML", cloud: "Cloud", security: "Cybersecurity", data: "Data", webdev: "Web dev",
  devops: "DevOps", programming: "Programming", networking: "Networking", marketing: "Marketing", career: "Career skills",
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
  "free-learn-paid-cert": "You can learn for free (audit), but the certificate costs money.",
  "free-learn-paid-exam": "The learning is free; the official certification exam has a fee.",
  "limited-time": "The certificate or exam is free only during a campaign. Check the dates.",
  "free-no-cert": "Free learning material without a certificate.",
};
export const credentialLabels: Record<Credential, string> = {
  certificate: "Certificate", badge: "Digital badge", exam: "Official exam", none: "No credential",
};

type Row = [id: string, title: string, company: string, domain: Domain, level: Level, hours: number, cost: Cost, credential: Credential, summary: string, trending?: boolean];

// Seed data for the MVP. Entries are from general knowledge and must be verified
// against each provider before launch (see the plan). Links point to provider portals.
const rows: Row[] = [
  ["ms-az900", "Azure Fundamentals (AZ-900) learning path", "microsoft", "cloud", "beginner", 10, "free-learn-paid-exam", "exam", "Core cloud concepts and Azure services; prepares you for the AZ-900 exam.", true],
  ["ms-ai900", "Azure AI Fundamentals (AI-900) learning path", "microsoft", "ai", "beginner", 9, "free-learn-paid-exam", "exam", "Machine learning, computer vision and generative AI on Azure.", true],
  ["ms-applied-skills", "Microsoft Applied Skills credentials", "microsoft", "ai", "intermediate", 8, "free-cert", "badge", "Scenario-based lab assessments that award a free, verifiable credential."],
  ["ms-python", "Take your first steps with Python", "microsoft", "programming", "beginner", 6, "free-cert", "badge", "Python basics with Microsoft Learn trophies as you finish modules."],
  ["ms-github-foundations", "GitHub Foundations learning path", "microsoft", "devops", "beginner", 8, "free-learn-paid-exam", "exam", "Git, repositories, pull requests and collaboration on GitHub."],
  ["g-genai", "Introduction to Generative AI", "google", "ai", "beginner", 1, "free-cert", "badge", "What generative AI is, how it works and how it differs from traditional ML.", true],
  ["g-llm", "Introduction to Large Language Models", "google", "ai", "beginner", 1, "free-cert", "badge", "How LLMs work, prompt tuning, and Google tools for building with them."],
  ["g-responsible-ai", "Introduction to Responsible AI", "google", "ai", "beginner", 1, "free-cert", "badge", "Why responsible AI matters and Google's AI principles."],
  ["g-analytics", "Google Analytics Certification", "google", "marketing", "beginner", 5, "free-cert", "certificate", "Set up, measure and report with Google Analytics; free Skillshop certificate."],
  ["g-ads-search", "Google Ads Search Certification", "google", "marketing", "beginner", 4, "free-cert", "certificate", "Build and optimize search campaigns; free Skillshop certificate."],
  ["g-cyber-cert", "Google Cybersecurity Professional Certificate", "google", "security", "beginner", 170, "free-learn-paid-cert", "certificate", "Career certificate on Coursera; audit some content free, certificate is paid."],
  ["aws-ccp", "AWS Cloud Practitioner Essentials", "aws", "cloud", "beginner", 6, "free-learn-paid-exam", "exam", "AWS cloud basics, core services, security and pricing.", true],
  ["aws-educate-cloud101", "AWS Educate: Introduction to Cloud 101", "aws", "cloud", "beginner", 4, "free-cert", "badge", "Beginner cloud concepts with a free AWS Educate badge."],
  ["aws-ml-ai", "Fundamentals of Machine Learning and Artificial Intelligence", "aws", "ai", "beginner", 2, "free-no-cert", "none", "Core ML and AI concepts with AWS services."],
  ["ibm-ai", "Artificial Intelligence Fundamentals", "ibm", "ai", "beginner", 10, "free-cert", "badge", "AI concepts, NLP, computer vision and ethics with an IBM badge.", true],
  ["ibm-cyber", "Cybersecurity Fundamentals", "ibm", "security", "beginner", 8, "free-cert", "badge", "Threats, attacks, cryptography and defenses with an IBM badge."],
  ["ibm-data", "Data Fundamentals", "ibm", "data", "beginner", 7, "free-cert", "badge", "Data concepts, cleaning and visualization with an IBM badge."],
  ["ibm-cc-python-ds", "Python for Data Science (Cognitive Class)", "ibm", "data", "beginner", 5, "free-cert", "badge", "Python basics for data analysis with a free badge."],
  ["cisco-cyber", "Introduction to Cybersecurity", "cisco", "security", "beginner", 6, "free-cert", "certificate", "Protect yourself online and explore cybersecurity careers.", true],
  ["cisco-netbasics", "Networking Basics", "cisco", "networking", "beginner", 22, "free-cert", "badge", "How networks work, IP addressing and building a small network."],
  ["cisco-python1", "Python Essentials 1", "cisco", "programming", "beginner", 30, "free-cert", "badge", "Python from scratch, aligned to the PCEP exam."],
  ["oracle-oci-found", "Oracle Cloud Infrastructure Foundations", "oracle", "cloud", "beginner", 5, "limited-time", "exam", "OCI basics; the foundations exam has been free during campaigns."],
  ["oracle-oci-genai", "OCI Generative AI Professional", "oracle", "ai", "intermediate", 6, "limited-time", "exam", "LLMs and generative AI on OCI; free exam offered in some campaigns."],
  ["sf-platform-basics", "Salesforce Platform Basics", "salesforce", "cloud", "beginner", 2, "free-cert", "badge", "Get started with the Salesforce platform and earn Trailhead badges."],
  ["sf-dev-beginner", "Developer Beginner trail", "salesforce", "programming", "beginner", 10, "free-cert", "badge", "Data modeling, formulas, Apex and Lightning basics on Trailhead."],
  ["sf-admin", "Salesforce Certified Administrator prep", "salesforce", "cloud", "intermediate", 30, "free-learn-paid-exam", "exam", "Free Trailhead prep; the Administrator exam is paid."],
  ["meta-ads", "Meta Blueprint: Ads Manager basics", "meta", "marketing", "beginner", 2, "free-no-cert", "none", "Create and manage ads on Facebook and Instagram."],
  ["meta-frontend", "Meta Front-End Developer Professional Certificate", "meta", "webdev", "beginner", 140, "free-learn-paid-cert", "certificate", "HTML, CSS, JavaScript and React on Coursera; certificate is paid."],
  ["hs-inbound", "Inbound Marketing Certification", "hubspot", "marketing", "beginner", 5, "free-cert", "certificate", "Attract, engage and delight customers; free HubSpot certification.", true],
  ["hs-content", "Content Marketing Certification", "hubspot", "marketing", "beginner", 6, "free-cert", "certificate", "Plan, create and promote content; free HubSpot certification."],
  ["hs-seo", "SEO Certification", "hubspot", "marketing", "beginner", 4, "free-cert", "certificate", "Keyword research, on-page SEO and link building."],
  ["ft-fcf", "Fortinet Certified Fundamentals in Cybersecurity", "fortinet", "security", "beginner", 10, "free-cert", "certificate", "Threat landscape and security fundamentals; free certification.", true],
  ["db-fundamentals", "Databricks Fundamentals Accreditation", "databricks", "data", "beginner", 2, "free-cert", "badge", "Lakehouse platform basics with a free accreditation badge."],
  ["db-genai", "Generative AI Fundamentals Accreditation", "databricks", "ai", "beginner", 2, "free-cert", "badge", "Generative AI concepts and use cases; free accreditation."],
  ["nv-jetson", "Getting Started with AI on Jetson Nano", "nvidia", "ai", "beginner", 8, "free-cert", "certificate", "Build deep learning projects on Jetson Nano; free DLI certificate."],
  ["infy-python", "Programming Fundamentals using Python", "infosys", "programming", "beginner", 20, "free-cert", "certificate", "Python programming basics with an Infosys Springboard certificate."],
  ["tcs-career-edge", "Career Edge: Young Professional", "tcs", "career", "beginner", 15, "free-cert", "certificate", "Communication, workplace and interview skills with a free certificate."],
  ["lf-linux", "Introduction to Linux (LFS101)", "linux-foundation", "devops", "beginner", 60, "free-learn-paid-cert", "certificate", "Linux basics from the command line; verified certificate is paid."],
  ["lf-k8s", "Introduction to Kubernetes (LFS158)", "linux-foundation", "devops", "beginner", 14, "free-learn-paid-cert", "certificate", "Kubernetes architecture and core objects; free to audit.", true],
  ["kg-python", "Kaggle Learn: Python", "kaggle", "programming", "beginner", 5, "free-cert", "certificate", "Python essentials for data science with a free certificate."],
  ["kg-intro-ml", "Kaggle Learn: Intro to Machine Learning", "kaggle", "ai", "beginner", 3, "free-cert", "certificate", "Build your first ML models with a free certificate.", true],
  ["kg-sql", "Kaggle Learn: Intro to SQL", "kaggle", "data", "beginner", 3, "free-cert", "certificate", "Query data with SQL and BigQuery; free certificate."],
  ["fcc-rwd", "Responsive Web Design Certification", "freecodecamp", "webdev", "beginner", 300, "free-cert", "certificate", "HTML and CSS through projects; free freeCodeCamp certification."],
  ["fcc-js", "JavaScript Algorithms and Data Structures", "freecodecamp", "webdev", "beginner", 300, "free-cert", "certificate", "JavaScript fundamentals and algorithms; free certification."],
  ["nptel-java", "Programming in Java (NPTEL)", "nptel", "programming", "intermediate", 48, "free-learn-paid-exam", "exam", "IIT course on Java; free to learn, proctored exam has a fee."],
  ["nptel-dsa", "Data Structures and Algorithms using Python (NPTEL)", "nptel", "programming", "intermediate", 32, "free-learn-paid-exam", "exam", "Classic DSA in Python; free to learn, exam has a fee."],
];

export const courses: Course[] = rows.map(([id, title, company, domain, level, hours, cost, credential, summary, trending]) => ({
  id, title, company, domain, level, hours, cost, credential, summary, trending,
  url: companyBySlug[company].portalUrl,
}));

export const courseById = Object.fromEntries(courses.map((c) => [c.id, c])) as Record<string, Course>;

// Example deadlines for the UI only. Replace with real, verified dates.
export const sampleDeadlines = [
  { day: "20", month: "NOV", title: "Free exam voucher drive", note: "Cloud fundamentals" },
  { day: "28", month: "NOV", title: "NPTEL exam registration", note: "January semester courses" },
  { day: "05", month: "DEC", title: "AI skills challenge", note: "Earn a free badge" },
  { day: "12", month: "DEC", title: "Security fundamentals cohort", note: "Free certificate" },
];
