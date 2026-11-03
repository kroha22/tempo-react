import {existsSync,readFileSync,readdirSync,statSync} from "node:fs";
import {join,relative,resolve,dirname} from "node:path";
import ts from "typescript";
import {pictureScenes} from "../features/content/picture-scenes.ts";

const root=process.cwd(),publicDir=join(root,"public"),buildDir=join(root,"dist-pages"),base="/tempo-react/";
const references=new Set<string>(),issues:string[]=[];
const media=/\.(?:webp|png|jpe?g|gif|svg|ico|wav|mp3|ogg|woff2?|ttf)(?:[?#].*)?$/i;
function files(dir:string):string[]{return readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?files(path):[path];});}
function checkPublic(url:string,owner:string){
  if(!url.startsWith("/")||url.startsWith("//"))return;
  references.add(url);const path=resolve(publicDir,`.${url.split(/[?#]/)[0]}`);
  if(!path.startsWith(`${publicDir}/`)||!existsSync(path))issues.push(`${owner}: missing public asset ${url}`);
}
for(const area of ["app","features","github-pages","shared"]){
  for(const file of files(join(root,area))){
    const text=readFileSync(file,"utf8"),owner=relative(root,file);
    if(/\.tsx?$/.test(file)){
      const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith("tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS);
      function visit(node:ts.Node){
        if(ts.isStringLiteralLike(node)&&media.test(node.text))checkPublic(node.text,owner);
        if(ts.isTemplateExpression(node)&&node.head.text.startsWith("/")&&media.test(node.templateSpans.at(-1)?.literal.text??"")){
          // Enumerate dynamic families; new families must explicitly join this audit.
          if(owner.endsWith("SerEstarExplanation.tsx"))for(const verb of ["ser","estar"])for(const mode of ["adult","kingdoms"])checkPublic(`/${verb}-guide-${mode}.webp`,owner);
          else if(owner.endsWith("AlphabetLetter.tsx"))for(const letter of "abcdefghijklmnopqrstuvwxyz")checkPublic(`/audio/alphabet/pt-PT/${letter}.wav`,owner);
          else if(owner.endsWith("food-illustrations.ts"))for(const part of ["a","b"])checkPublic(`/images/vocabulary/food-drawn-${part}-v1.webp`,owner);
          else if(owner.endsWith("body-scenes.ts"))for(const id of ["outside","inside"])checkPublic(`/images/scenes/body-${id}-${id==="inside"?"v2":"v1"}.webp`,owner);
          else if(owner.endsWith("picture-scenes.ts"))for(const scene of pictureScenes)checkPublic(`/images/scenes/${scene.id}.webp`,owner);
          else if(!node.head.text.startsWith("/__school-sheets/"))issues.push(`${owner}: unverified dynamic asset ${node.getText(source)}`);
        }
        if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
          const tag=node.tagName.getText(source);
          if(tag==="img"||tag==="image")for(const attr of node.attributes.properties){
            if(!ts.isJsxAttribute(attr)||!["src","href"].includes(attr.name.getText(source)))continue;
            const value=attr.initializer?.getText(source)??"";
            const privatePreview=owner.endsWith("TestPreparation.tsx")&&value.includes("/__school-sheets/");
            if(!value.includes("publicAssetUrl(")&&!privatePreview&&!/^['"](?:https?:|data:|\/\/)/.test(value))issues.push(`${owner}: native ${tag} asset must use publicAssetUrl`);
          }
        }
        ts.forEachChild(node,visit);
      }
      visit(source);
    }
    if(file.endsWith("css"))for(const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))checkPublic(match[1],owner);
  }
}
for(const file of files(publicDir).filter(file=>file.endsWith("svg"))){
  for(const match of readFileSync(file,"utf8").matchAll(/(?:href|src)=["']([^"']+)["']/g)){
    if(/^(?:https?:|data:|#)/.test(match[1]))continue;
    if(match[1].startsWith("/"))checkPublic(match[1],relative(root,file));
    else if(!existsSync(resolve(dirname(file),match[1])))issues.push(`${relative(root,file)}: missing SVG reference ${match[1]}`);
  }
}
if(process.argv.includes("--built")){
  for(const source of files(publicDir)){
    const dest=join(buildDir,relative(publicDir,source));
    if(!existsSync(dest)||!readFileSync(source).equals(readFileSync(dest)))issues.push(`Build did not preserve public/${relative(publicDir,source)}`);
  }
  for(const file of files(buildDir).filter(file=>/\.(?:css|html)$/.test(file))){
    const text=readFileSync(file,"utf8");
    const urls=[...text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g),...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)];
    for(const match of urls){
      const url=match[1];if(/^(?:https?:|data:|#|\/\/)/.test(url))continue;
      const path=url.startsWith("/")?join(buildDir,url.slice(base.length)):resolve(dirname(file),url);
      if(url.startsWith("/")&&!url.startsWith(base))issues.push(`${relative(root,file)}: asset escapes Pages base: ${url}`);
      else if(!existsSync(path))issues.push(`${relative(root,file)}: missing built asset ${url}`);
    }
  }
}
if(issues.length)throw new Error(issues.join("\n"));
console.log(`Public assets passed: ${references.size} referenced paths, ${files(publicDir).length} public files${process.argv.includes("--built")?", exact build copies and CSS/HTML URLs verified":""}.`);
