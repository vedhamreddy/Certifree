import type { Certificate } from "./certificates";
import type { LearningItem } from "./learning";
import type { Categories } from "./sync";

export type State = { bookmarks: string[]; learning: LearningItem[]; certificates: Certificate[] };
export type Pair<T> = { local: T; cloud: T };
export type Diff = {
  bookmarks: { localOnly: string[]; cloudOnly: string[] };
  learning: { localOnly: LearningItem[]; cloudOnly: LearningItem[]; conflicts: Pair<LearningItem>[] };
  certificates: { localOnly: Certificate[]; cloudOnly: Certificate[]; conflicts: Pair<Certificate>[] };
  files: { localOnly: Certificate[]; cloudOnly: Certificate[]; conflicts: Pair<Certificate>[] };
};

const n = (v: unknown) => (v === undefined || v === null || v === "" ? null : v);
const sameLearning = (a: LearningItem, b: LearningItem) =>
  a.progress === b.progress && n(a.targetDate) === n(b.targetDate) && a.startedOn === b.startedOn;
const CERT_FIELDS = ["title", "provider", "providerName", "domain", "issuedOn", "credentialId", "link", "courseId"] as const;
const sameCert = (a: Certificate, b: Certificate) => CERT_FIELDS.every((k) => n(a[k]) === n(b[k]));

/** Compares this device with the account. Pure: decides nothing, changes nothing. */
export function diff(local: State, cloud: State, cats: Categories): Diff {
  const d: Diff = {
    bookmarks: { localOnly: [], cloudOnly: [] },
    learning: { localOnly: [], cloudOnly: [], conflicts: [] },
    certificates: { localOnly: [], cloudOnly: [], conflicts: [] },
    files: { localOnly: [], cloudOnly: [], conflicts: [] },
  };
  if (cats.bookmarks) {
    const c = new Set(cloud.bookmarks), l = new Set(local.bookmarks);
    d.bookmarks.localOnly = local.bookmarks.filter((x) => !c.has(x));
    d.bookmarks.cloudOnly = cloud.bookmarks.filter((x) => !l.has(x));
  }
  if (cats.learning) {
    const c = new Map(cloud.learning.map((x) => [x.courseId, x]));
    const l = new Map(local.learning.map((x) => [x.courseId, x]));
    for (const x of local.learning) {
      const y = c.get(x.courseId);
      if (!y) d.learning.localOnly.push(x);
      else if (!sameLearning(x, y)) d.learning.conflicts.push({ local: x, cloud: y });
    }
    d.learning.cloudOnly = cloud.learning.filter((x) => !l.has(x.courseId));
  }
  if (cats.certificates) {
    const c = new Map(cloud.certificates.map((x) => [x.id, x]));
    const l = new Map(local.certificates.map((x) => [x.id, x]));
    for (const x of local.certificates) {
      const y = c.get(x.id);
      if (!y) {
        d.certificates.localOnly.push(x);
        continue;
      }
      if (!sameCert(x, y)) d.certificates.conflicts.push({ local: x, cloud: y });
      if (cats.files) {
        if (x.fileName && !y.fileName) d.files.localOnly.push(x);
        else if (!x.fileName && y.fileName) d.files.cloudOnly.push(y);
        else if (x.fileName && y.fileName && x.fileName !== y.fileName) d.files.conflicts.push({ local: x, cloud: y });
      }
    }
    d.certificates.cloudOnly = cloud.certificates.filter((x) => !l.has(x.id));
  }
  return d;
}

export function countDiff(d: Diff) {
  return (
    d.bookmarks.localOnly.length + d.bookmarks.cloudOnly.length +
    d.learning.localOnly.length + d.learning.cloudOnly.length + d.learning.conflicts.length +
    d.certificates.localOnly.length + d.certificates.cloudOnly.length + d.certificates.conflicts.length +
    d.files.localOnly.length + d.files.cloudOnly.length + d.files.conflicts.length
  );
}
