import {createRoot} from "react-dom/client";
import {catalogWords} from "../../features/content/learning-catalog-view";
import {tableIllustrationLabels} from "../../features/content/table-illustrations";
import {VocabularyIllustration} from "../../features/practice/VocabularyIllustration";
createRoot(document.getElementById("root")!).render(<main style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:12,fontFamily:"sans-serif",background:"#f3f0e6"}}>{tableIllustrationLabels.map(label=>{const word=catalogWords.find(w=>w.label===label)!;return <figure key={label} style={{margin:0,padding:8,textAlign:"center",background:"white",borderRadius:10}}><VocabularyIllustration illustration={word.illustration!}/><figcaption>{label}</figcaption></figure>;})}</main>);
