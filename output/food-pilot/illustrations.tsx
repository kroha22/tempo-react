import { createRoot } from "react-dom/client";
import { catalogWords } from "../../features/content/learning-catalog-view";
import { VocabularyIllustration } from "../../features/practice/VocabularyIllustration";
createRoot(document.getElementById("root")!).render(<main style={{display:"grid",gridTemplateColumns:"repeat(8, 1fr)",gap:8,padding:12,fontFamily:"sans-serif",background:"#f3f0e6"}}>{catalogWords.filter(w=>w.illustration).map(word=><figure key={word.id} style={{margin:0,background:"white",padding:4,textAlign:"center",borderRadius:8}}><VocabularyIllustration illustration={word.illustration!}/><figcaption style={{fontSize:12}}>{word.label}</figcaption></figure>)}</main>);
