export type ProviderKind = "company" | "platform";

export type Provider = {
  slug: string;
  name: string;
  kind: ProviderKind;
  portal: string;
  portalUrl: string;
  color: string;
  blurb: string;
};

export const providers: Provider[] = [
  // Companies: certificates and badges issued by the company itself
  { slug: "microsoft", kind: "company", name: "Microsoft", portal: "Microsoft Learn", portalUrl: "https://learn.microsoft.com/en-us/training/", color: "#0EA5E9", blurb: "Free modules and learning paths for Azure, AI, Power Platform and GitHub. Applied Skills credentials are free; certification exams are usually paid." },
  { slug: "google", kind: "company", name: "Google", portal: "Google Skills", portalUrl: "https://www.skills.google/", color: "#EA4335", blurb: "Free skill badges for Google Cloud and generative AI, plus Skillshop training for Google Ads and Analytics." },
  { slug: "aws", kind: "company", name: "AWS", portal: "AWS Skill Builder", portalUrl: "https://aws.amazon.com/training/digital/", color: "#F59E0B", blurb: "Free digital courses on AWS Skill Builder and AWS Educate badges. Certification exams are paid." },
  { slug: "ibm", kind: "company", name: "IBM", portal: "IBM SkillsBuild", portalUrl: "https://skillsbuild.org/", color: "#1D4ED8", blurb: "Free courses with verifiable digital credentials in AI, data, cybersecurity and cloud." },
  { slug: "cisco", kind: "company", name: "Cisco", portal: "Cisco Networking Academy", portalUrl: "https://www.netacad.com/", color: "#0891B2", blurb: "Free self-paced courses in networking, cybersecurity and Python." },
  { slug: "oracle", kind: "company", name: "Oracle", portal: "Oracle MyLearn", portalUrl: "https://mylearn.oracle.com/", color: "#DC2626", blurb: "Free OCI learning paths. Foundations exams have been free during some campaigns." },
  { slug: "salesforce", kind: "company", name: "Salesforce", portal: "Trailhead", portalUrl: "https://trailhead.salesforce.com/", color: "#0284C7", blurb: "Free badges and superbadges on Trailhead. Certification exams are paid." },
  { slug: "meta", kind: "company", name: "Meta", portal: "Meta Blueprint", portalUrl: "https://www.facebookblueprint.com/", color: "#2563EB", blurb: "Free courses on Meta ads and marketing. Blueprint certification exams are paid." },
  { slug: "hubspot", kind: "company", name: "HubSpot", portal: "HubSpot Academy", portalUrl: "https://academy.hubspot.com/", color: "#F97316", blurb: "Free marketing, sales and service courses with certifications." },
  { slug: "fortinet", kind: "company", name: "Fortinet", portal: "Fortinet Training Institute", portalUrl: "https://training.fortinet.com/", color: "#E11D48", blurb: "Entry-level cybersecurity courses and the Fortinet Certified Fundamentals certification." },
  { slug: "databricks", kind: "company", name: "Databricks", portal: "Databricks Academy", portalUrl: "https://www.databricks.com/learn/training/home", color: "#EF4444", blurb: "Self-paced courses and short fundamentals accreditations for data and AI." },
  { slug: "nvidia", kind: "company", name: "NVIDIA", portal: "NVIDIA Deep Learning Institute", portalUrl: "https://www.nvidia.com/en-in/training/online/", color: "#65A30D", blurb: "Free self-paced AI and accelerated computing courses; some include a certificate." },
  { slug: "infosys", kind: "company", name: "Infosys", portal: "Infosys Springboard", portalUrl: "https://infyspringboard.onwingspan.com/", color: "#0369A1", blurb: "Free courses with certificates in programming, data and soft skills." },
  { slug: "tcs", kind: "company", name: "TCS", portal: "TCS iON", portalUrl: "https://www.tcsion.com/courses/main-page-career-edge/", color: "#7C3AED", blurb: "Free career-readiness courses for students and graduates." },
  { slug: "linux-foundation", kind: "company", name: "Linux Foundation", portal: "LF Education", portalUrl: "https://training.linuxfoundation.org/", color: "#334155", blurb: "Free introductory courses on Linux, Kubernetes and open source with digital badges. Certification exams are paid." },
  // Platforms: learning marketplaces and universities
  { slug: "coursera", kind: "platform", name: "Coursera", portal: "Coursera", portalUrl: "https://www.coursera.org/", color: "#0056D2", blurb: "University and company courses. Many can be started free; the certificate is usually paid, with financial aid available." },
  { slug: "edx", kind: "platform", name: "edX", portal: "edX", portalUrl: "https://www.edx.org/", color: "#02262B", blurb: "University courses such as Harvard's CS50. Audit free; verified certificates are paid." },
  { slug: "udemy", kind: "platform", name: "Udemy", portal: "Udemy", portalUrl: "https://www.udemy.com/courses/free/", color: "#A435F0", blurb: "Thousands of free short courses from instructors. Free courses do not include a certificate." },
  { slug: "freecodecamp", kind: "platform", name: "freeCodeCamp", portal: "freeCodeCamp", portalUrl: "https://www.freecodecamp.org/learn", color: "#0A0A23", blurb: "Full project-based curricula with free certifications." },
  { slug: "kaggle", kind: "platform", name: "Kaggle", portal: "Kaggle Learn", portalUrl: "https://www.kaggle.com/learn", color: "#20BEFF", blurb: "Short, hands-on courses in Python, ML and data with free certificates." },
  { slug: "nptel", kind: "platform", name: "NPTEL", portal: "NPTEL / SWAYAM", portalUrl: "https://nptel.ac.in/", color: "#B45309", blurb: "Free IIT and IISc courses each semester; the proctored certificate exam has a fee." },
  { slug: "swayam", kind: "platform", name: "SWAYAM", portal: "SWAYAM", portalUrl: "https://swayam.gov.in/", color: "#9A3412", blurb: "India's national MOOC platform. Learning is free; certificate exams have a fee." },
  { slug: "greatlearning", kind: "platform", name: "Great Learning", portal: "Great Learning Academy", portalUrl: "https://www.mygreatlearning.com/academy", color: "#0EA5A5", blurb: "Free beginner courses; the completion certificate now has a fee." },
  { slug: "simplilearn", kind: "platform", name: "Simplilearn", portal: "Simplilearn SkillUp", portalUrl: "https://www.simplilearn.com/skillup-free-online-courses", color: "#F97316", blurb: "Free short courses with a free completion certificate." },
];

export const providerBySlug = Object.fromEntries(providers.map((p) => [p.slug, p])) as Record<string, Provider>;
export const companies = providers.filter((p) => p.kind === "company");
export const platforms = providers.filter((p) => p.kind === "platform");
