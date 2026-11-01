import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import type {Plugin} from "vite";

/** Private reference photographs: development only, never copied into a build. */
export function privateSchoolSheets():Plugin{
  return {name:"private-school-sheets",apply:"serve",configureServer(server){
    server.middlewares.use((req,res,next)=>{
      const match=/^\/__school-sheets\/([123])\.webp$/.exec(req.url??"");
      if(!match){next();return;}
      const path=fileURLToPath(new URL(`../output/private-preparation-previews/${match[1]}.webp`,import.meta.url));
      void readFile(path).then(data=>{res.setHeader("Content-Type","image/webp");res.setHeader("Cache-Control","no-store");res.end(data);},()=>{res.statusCode=404;res.end();});
    });
  }};
}
