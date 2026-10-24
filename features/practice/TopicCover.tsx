import type { VocabularyGroup, VocabularyWord } from "../content/vocabulary-model";
import type { ImageMatchingDefinition } from "./image-matching";
import { VocabularyIllustration } from "./VocabularyIllustration";
import { publicAssetUrl } from "../../shared/public-asset";
import { lessonCovers } from "./lesson-covers";
import styles from "./VocabularyStudy.module.css";

const preferred:Readonly<Record<string,string>>={"topic:food":"image-market","topic:animals":"image-farm","topic:school":"image-school","topic:city":"image-street","topic:nature":"image-garden","topic:everyday":"image-breakfast","topic:vocabulary-body":"image-body-outside"};
const coverWords:Readonly<Record<string,string>>={"topic:people":"feliz","topic:vocabulary-lessons":"o livro"};
const symbols:Readonly<Record<string,string>>={
  "topic:vocabulary-family":"M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a6 6 0 0 1 12 0v3m0-7a5 5 0 0 1 8 4v3",
  "topic:vocabulary-body":"M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 3h16m-8-2v8m-5 7 5-7 5 7",
  "topic:health":"m12 21-8-8C-2 7 5-1 12 6c7-7 14 1 8 7l-8 8Z m-7-9h4l2-4 3 8 2-4h3",
  "topic:work":"M3 7h18v14H3z M8 7V3h8v4 M3 12l9 3 9-3 M10 14h4",
  "topic:people":"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM7 9h.01 M17 9h.01 M7 14q5 7 10 0",
  "topic:vocabulary-verbs":"m13 1-9 12h7l-1 10 10-13h-7l1-9Z",
};
export function TopicCover({group,words,images}:{group:VocabularyGroup;words:readonly VocabularyWord[];images:readonly ImageMatchingDefinition[]}) {
  const scene=images.find(image=>image.id===preferred[group.id])??images.find(image=>group.imageActivityIds?.includes(image.id));
  const ids=new Set(group.subgroups.flatMap(subgroup=>subgroup.sets.flatMap(set=>set.words)));
  const illustrated=words.find(word=>ids.has(word.id)&&word.illustration&&(!coverWords[group.id]||word.label===coverWords[group.id]));
  const coverSrc=lessonCovers[group.id]??scene?.image.src;
  return <span className={styles.topicCover} aria-hidden="true">{coverSrc?
    // eslint-disable-next-line @next/next/no-img-element
    <img src={publicAssetUrl(coverSrc)} alt="" loading="lazy"/>
    :illustrated?<VocabularyIllustration illustration={illustrated.illustration!}/>:<svg viewBox="0 0 24 24"><path d={symbols[group.id]??"M3 3q5-2 9 1 4-3 9-1v17q-5-2-9 1-4-3-9-1V3Z M12 4v17"}/></svg>}
  </span>;
}
