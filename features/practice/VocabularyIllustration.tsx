import { useId } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";
import styles from "./VocabularyCards.module.css";
import {publicAssetUrl} from "../../shared/public-asset";

export function VocabularyIllustration({ illustration }: {illustration:NonNullable<VocabularyWord["illustration"]>}) {
  const clipId = useId();
  const crop = illustration.crop;
  if (crop) return <svg className={styles.illustration} aria-hidden="true" viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`}>
    <defs><clipPath id={clipId}><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height}/></clipPath></defs>
    <image href={publicAssetUrl(illustration.src)} width={crop.sourceWidth} height={crop.sourceHeight} clipPath={`url(#${clipId})`}/>
  </svg>;
  const grid = illustration.grid ?? 1;
  return <span className={styles.illustration} aria-hidden="true" style={{
    backgroundImage:`url(${publicAssetUrl(illustration.src)})`,backgroundSize:`${grid*100}% ${grid*100}%`,
    backgroundPosition:grid===1?"center":`${illustration.column*100/(grid-1)}% ${illustration.row*100/(grid-1)}%`,
  }}/>;
}
