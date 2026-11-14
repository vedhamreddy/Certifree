/**
 * Provider logos, saved in public/logos (never hotlinked). Used only to identify each
 * provider next to its name. Trademarks belong to their owners; sources are in the README.
 * `aspect` is width / height, so wide wordmarks get a wider chip.
 */
export const providerLogos: Record<string, { src: string; aspect: number }> = {
  microsoft: { src: "/logos/microsoft.svg", aspect: 1 },
  google: { src: "/logos/google.svg", aspect: 1 },
  aws: { src: "/logos/aws.svg", aspect: 1.67 },
  ibm: { src: "/logos/ibm.svg", aspect: 2.68 },
  cisco: { src: "/logos/cisco.svg", aspect: 1 },
  oracle: { src: "/logos/oracle.svg", aspect: 7.7 },
  salesforce: { src: "/logos/salesforce.svg", aspect: 1.43 },
  meta: { src: "/logos/meta.svg", aspect: 1 },
  hubspot: { src: "/logos/hubspot.svg", aspect: 1 },
  fortinet: { src: "/logos/fortinet.svg", aspect: 1 },
  databricks: { src: "/logos/databricks.svg", aspect: 1 },
  nvidia: { src: "/logos/nvidia.svg", aspect: 1 },
  infosys: { src: "/logos/infosys.svg", aspect: 1 },
  tcs: { src: "/logos/tcs.svg", aspect: 1 },
  "linux-foundation": { src: "/logos/linux-foundation.svg", aspect: 1 },
  coursera: { src: "/logos/coursera.svg", aspect: 1 },
  edx: { src: "/logos/edx.svg", aspect: 1 },
  udemy: { src: "/logos/udemy.svg", aspect: 1 },
  freecodecamp: { src: "/logos/freecodecamp.svg", aspect: 1 },
  kaggle: { src: "/logos/kaggle.svg", aspect: 1 },
  nptel: { src: "/logos/nptel.png", aspect: 4.35 },
  swayam: { src: "/logos/swayam.png", aspect: 2.41 },
  greatlearning: { src: "/logos/greatlearning.svg", aspect: 1 },
  simplilearn: { src: "/logos/simplilearn.png", aspect: 1 },
};
