"use client";
import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {useQueryScope} from "@/shared/query/SessionQueryBoundary";
import {useProfileLearning} from "../../practice/profile-learning";
import {usePracticePlan} from "../../practice/plan/PracticePlanContext";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {learningProgressOptions} from "../query/queries";
import {adultMaterialKey,adultMaterialsForBlock,adultRouteBlocks,type AdultRouteBlockKey} from "../../content/adult-route";
import {adultMaterialSources,type AdultMaterialSource} from "../../content/adult-route-catalog";
import {adultRequiredLessons,adultMaterialRole} from "../../content/adult-route-lessons";
import {adultLessonGroups} from "../../content/adult-lesson-groups";
import {readAdultProgress,type AdultMaterialResult} from "./adult-progress";
import styles from "./GeneralPlan.module.css";
import {localTransport} from "@/shared/http/local-transport";

const labels:Record<AdultMaterialResult["state"],string>={new:"Не начато",active:"В процессе",done:"Пройдено",review:"Стоит повторить",unknown:"Статус недоступен",untracked:"Дополнительный материал"};
const wordHref=(id:string)=>`/learning/quick-words?set=${encodeURIComponent(id)}`;

export function AdultGeneralPlan({practiceOnly=false,initialBlock}:{practiceOnly?:boolean;initialBlock?:string}){
  const learner=useProfileLearning(),practice=usePracticePlan(),scope=useQueryScope();
  const query=useQuery({...learningProgressOptions(scope.scopeKey),enabled:!practiceOnly&&!scope.blocked,staleTime:0,refetchOnMount:"always"});
  const sources=useMemo(()=>adultMaterialSources(),[]);
  const byKey=useMemo(()=>new Map(sources.map(source=>[adultMaterialKey(source),source])),[sources]);
  if(!learner||learner.profile.child)return null;
  const profileId=learner.profile.id;
  const progress=readAdultProgress({profile:learner.profile,
    routeMode:localTransport()?"legacy-practice":"assessed",
    learning:!practiceOnly&&!scope.blocked&&!query.isError&&query.data?{profileId,status:"ready",value:query.data}:{profileId,status:query.isPending&&!practiceOnly&&!scope.blocked?"loading":"error"},
    practice:practice&&!practice.error?{profileId,status:"ready",value:practice.progress}:{profileId,status:"error"},
    activities:!learner.savingError?{profileId,status:"ready",value:learner.learning}:{profileId,status:"error"},
  });
  const results=new Map(progress.materials.map(result=>[result.key,result]));
  const next=progress.continuation,nextSource=next?byKey.get(next.key):undefined;
  const nextBlock=next?adultRouteBlocks.find(block=>adultMaterialsForBlock(block.key).some(ref=>adultMaterialKey(ref)===next.key)):undefined;
  const continueHref=next?.kind==="words"&&next.initialSetId?`${wordHref(next.initialSetId)}&resume=1`:next?.href;
  const total=Object.values(adultRequiredLessons).flat().length;
  const completed=progress.blocks.flatMap(block=>block.required).filter(result=>result.state==="done"||result.previouslyDemonstrated).length;
  function material(source:AdultMaterialSource,required=false){
    const key=adultMaterialKey(source),result=results.get(key);
    return <li key={key} className={styles.material} data-material-key={key}>
      <strong>{source.title}</strong>
      <small>{source.availability==="planned"?"Объяснение и задания готовятся · слова доступны":result?.reason==="legacy-route-practice"?"Короткая практика пройдена":result?labels[result.state]:"Материал доступен"}{result?.previouslyDemonstrated?" · проверка ранее пройдена":""}</small>
      <nav className={styles.links} aria-label={`Материалы: ${source.title}`}>
        {source.explanationHref&&<LegacyLessonLink href={source.explanationHref}>Объяснение →</LegacyLessonLink>}
        {source.href&&<LegacyLessonLink href={source.href}>{source.kind==="topic"?`Открыть урок: ${source.title} →`:required?"Открыть занятие →":"Открыть материал →"}</LegacyLessonLink>}
        {source.wordsHref&&<LegacyLessonLink href={source.wordsHref}>Слова занятия →</LegacyLessonLink>}
        {source.kind==="word-set"&&<LegacyLessonLink href={wordHref(source.sourceId)}>Посмотреть слова →</LegacyLessonLink>}
      </nav>
    </li>;
  }
  function extra(block:AdultRouteBlockKey,title:string,select:(source:AdultMaterialSource)=>boolean){
    const keys=adultRequiredLessons[block];
    const materials=adultMaterialsForBlock(block).map(ref=>byKey.get(adultMaterialKey(ref))).filter((source):source is AdultMaterialSource=>!!source&&!source.legacyOnly&&!keys.includes(adultMaterialKey(source))&&select(source));
    return materials.length>0&&<details className={styles.block}><summary><strong>{title}</strong><span>{materials.length}</span></summary><ul className={styles.materials}>{materials.map(source=>material(source))}</ul></details>;
  }
  return <section className={`${styles.plan} ${styles.adult}`} aria-label="Общий план обучения">
    <header className={styles.intro} data-ui-surface><h1 tabIndex={-1}>Общий план</h1>{progress.status!=="unavailable"&&<small>Базовые занятия · {completed}/{total}</small>}</header>
    {next&&nextSource&&continueHref&&<article className={styles.continue} data-route-block={nextBlock?.key}><span>{next.kind==="words"?"Продолжить слова":next.state==="active"?"Продолжить начатое":next.state==="review"?"Повторить занятие":"Следующее занятие"}</span><h2>{nextSource.title}</h2><LegacyLessonLink className={styles.primary} href={continueHref}>{next.kind==="words"?"Продолжить слова →":next.state==="active"?"Продолжить урок →":"Начать занятие →"}</LegacyLessonLink>{next.kind!=="words"&&nextSource.explanationHref&&<LegacyLessonLink className={styles.secondary} href={nextSource.explanationHref}>Сначала прочитать объяснение →</LegacyLessonLink>}</article>}
    {progress.status==="complete"&&<p role="status">Базовые занятия пройдены. Можно повторить материал или перейти к дополнительным занятиям.</p>}
    {query.isPending&&!practiceOnly&&!scope.blocked?<p role="status">Загружаем результаты…</p>:progress.status==="unavailable"&&<div role="alert"><p>Не удалось прочитать все результаты. Сохранения не изменены; материалы можно открыть ниже.</p><button type="button" onClick={()=>{if(scope.blocked)scope.retryAccess();else if(!practiceOnly)void query.refetch();practice?.retry();}}>Повторить загрузку результатов</button></div>}
    <LegacyLessonLink className={styles.wordsEntry} href="/learning/quick-words"><strong>Слова и повторение</strong><span aria-hidden="true">→</span></LegacyLessonLink>
    <div aria-label="Блоки обучения">{adultRouteBlocks.map((block,index)=>{
      const summary=progress.blocks.find(row=>row.key===block.key)!;
      const done=summary.required.filter(result=>result.state==="done"||result.previouslyDemonstrated).length;
      return <details key={block.key} className={styles.section} data-route-block={block.key} open={initialBlock===block.key}>
        <summary><strong>{index+1}. {block.title}</strong><span>{progress.status==="unavailable"?`${summary.required.length} занятий`:`${done}/${summary.required.length}`}</span></summary>
        <div className={styles.content}><p>{block.goal}</p>{adultLessonGroups(block.key).map(group=><section className={styles.lessonGroup} key={group.title} aria-label={group.title} data-lesson-group>
          <h3>{group.title}</h3><ol className={styles.materials}>{group.lessons.map(key=>material(byKey.get(key)!,true))}</ol>
        </section>)}
          {extra(block.key,"Слова темы",source=>source.kind==="word-set")}
          {extra(block.key,"Ещё объяснения и практика",source=>source.kind!=="word-set"&&adultMaterialRole(adultMaterialKey(source))!=="extension")}
          {extra(block.key,"Дальнейшие занятия",source=>adultMaterialRole(adultMaterialKey(source))==="extension")}
          <details className={styles.info}><summary>Что ещё готовится</summary><p>{block.gap}. Отметка базовых занятий не означает освоение всех материалов темы.</p></details>
        </div>
      </details>;
    })}</div>
    <footer className={styles.footer}><LegacyLessonLink href="/learning/topics">Найти тему или упражнение →</LegacyLessonLink></footer>
  </section>;
}
