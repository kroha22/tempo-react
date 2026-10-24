import {createRoot} from "react-dom/client";
import {catalogWords} from "../../features/content/learning-catalog-view";
import {everydayIllustrationLabels} from "../../features/content/everyday-illustrations";
import {VocabularyIllustration} from "../../features/practice/VocabularyIllustration";
createRoot(document.getElementById("root")!).render(<main style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,padding:12,fontFamily:"sans-serif",background:"#f3f0e6"}}>{everydayIllustrationLabels.map(label=>{const word=catalogWords.find(w=>w.label===label)!;return <figure key={label} style={{margin:0,padding:8,textAlign:"center",background:"white",borderRadius:10}}><VocabularyIllustration illustration={word.illustration!}/><figcaption style={{fontSize:13}}>{label}</figcaption></figure>;})}</main>);
