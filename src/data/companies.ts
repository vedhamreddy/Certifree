export type Company = {
  slug: string;
  name: string;
  portal: string;
  portalUrl: string;
  color: string;
  blurb: string;
};

export const companies: Company[] = [
  { slug: "microsoft", name: "Microsoft", portal: "Microsoft Learn", portalUrl: "https://learn.microsoft.com/training/", color: "#0EA5E9", blurb: "Free modules and learning paths for Azure, AI, Power Platform and GitHub. Applied Skills credentials are free; certification exams are usually paid." },
  { slug: "google", name: "Google", portal: "Google Cloud Skills Boost, Skillshop", portalUrl: "https://www.cloudskillsboost.google/", color: "#EA4335", blurb: "Free skill badges for Google Cloud and generative AI, and free Skillshop certifications for Ads and Analytics." },
  { slug: "aws", name: "AWS", portal: "AWS Skill Builder, AWS Educate", portalUrl: "https://skillbuilder.aws/", color: "#F59E0B", blurb: "Hundreds of free digital courses and AWS Educate badges. Certification exams are paid." },
  { slug: "ibm", name: "IBM", portal: "IBM SkillsBuild", portalUrl: "https://skillsbuild.org/", color: "#1D4ED8", blurb: "Free courses with verifiable digital badges in AI, data, cybersecurity and cloud." },
  { slug: "cisco", name: "Cisco", portal: "Cisco Networking Academy", portalUrl: "https://www.netacad.com/", color: "#0891B2", blurb: "Free self-paced courses in networking, cybersecurity and Python with certificates and badges." },
  { slug: "oracle", name: "Oracle", portal: "Oracle University", portalUrl: "https://education.oracle.com/", color: "#DC2626", blurb: "Free OCI learning. Some foundations exams have been free during campaigns." },
  { slug: "salesforce", name: "Salesforce", portal: "Trailhead", portalUrl: "https://trailhead.salesforce.com/", color: "#0284C7", blurb: "Free badges and superbadges on Trailhead. Certification exams are paid." },
  { slug: "meta", name: "Meta", portal: "Meta Blueprint", portalUrl: "https://www.facebookblueprint.com/", color: "#2563EB", blurb: "Free courses on Meta ads and marketing. Professional certificates on Coursera are paid." },
  { slug: "hubspot", name: "HubSpot", portal: "HubSpot Academy", portalUrl: "https://academy.hubspot.com/", color: "#F97316", blurb: "Free marketing, sales and service certifications." },
  { slug: "fortinet", name: "Fortinet", portal: "Fortinet Training Institute", portalUrl: "https://training.fortinet.com/", color: "#E11D48", blurb: "Free entry-level cybersecurity courses and certifications." },
  { slug: "databricks", name: "Databricks", portal: "Databricks Academy", portalUrl: "https://www.databricks.com/learn/training", color: "#EF4444", blurb: "Free self-paced courses and fundamentals accreditations for data and AI." },
  { slug: "nvidia", name: "NVIDIA", portal: "NVIDIA Deep Learning Institute", portalUrl: "https://www.nvidia.com/en-us/training/", color: "#65A30D", blurb: "A selection of free self-paced AI courses with certificates." },
  { slug: "infosys", name: "Infosys", portal: "Infosys Springboard", portalUrl: "https://infyspringboard.onwingspan.com/", color: "#0369A1", blurb: "Free courses with certificates in programming, data and soft skills." },
  { slug: "tcs", name: "TCS", portal: "TCS iON", portalUrl: "https://learning.tcsionhub.in/", color: "#7C3AED", blurb: "Free career-readiness courses with certificates." },
  { slug: "linux-foundation", name: "Linux Foundation", portal: "LF Training", portalUrl: "https://training.linuxfoundation.org/", color: "#334155", blurb: "Free introductory courses on Linux, Kubernetes and open source. Certification exams are paid." },
  { slug: "kaggle", name: "Kaggle", portal: "Kaggle Learn", portalUrl: "https://www.kaggle.com/learn", color: "#06B6D4", blurb: "Short, free hands-on courses in Python, ML and data with free certificates." },
  { slug: "freecodecamp", name: "freeCodeCamp", portal: "freeCodeCamp", portalUrl: "https://www.freecodecamp.org/learn", color: "#0F172A", blurb: "Free full-length curricula with free certifications." },
  { slug: "nptel", name: "NPTEL", portal: "NPTEL / SWAYAM", portalUrl: "https://nptel.ac.in/", color: "#B45309", blurb: "Free university courses from the IITs and IISc; the proctored certificate exam has a fee." },
];

export const companyBySlug = Object.fromEntries(companies.map((c) => [c.slug, c])) as Record<string, Company>;
