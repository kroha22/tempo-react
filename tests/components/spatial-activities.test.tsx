import {fireEvent,render,screen} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {SpatialPlacement,GraphicDictation} from "@/features/practice/SpatialActivities";
import {dictationTasks} from "@/features/content/spatial-practice";
import {expectedTrace} from "@/features/practice/spatial-model";

it("places without dragging, records one error and permits undo and retry",()=>{
  const mistake=vi.fn();render(<SpatialPlacement child onComplete={()=>{}} onMistake={mistake}/>);
  fireEvent.click(screen.getByRole("button",{name:"o gato"}));
  fireEvent.click(screen.getByRole("button",{name:"Под коробкой"}));
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(mistake).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button",{name:"↶ Отменить"}));fireEvent.click(screen.getByRole("button",{name:"Внутри коробки"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(screen.getByText(/Certo!/)).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Дальше"}));expect(screen.getByRole("heading")).toHaveTextContent("livro");
});
it("checks a closed graphic dictation including its return to start",()=>{
  render(<GraphicDictation child={false} onComplete={()=>{}}/>);
  const path=expectedTrace(dictationTasks[0]);
  for(const point of path.slice(1)){fireEvent.click(screen.getByRole("button",{name:new RegExp(`^Строка ${point.y+1}, столбец ${point.x+1}(, старт)?$`)}));}
  fireEvent.click(screen.getByRole("button",{name:"↶ Шаг назад"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(screen.getByText(/не закончен/)).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:/, старт$/}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(screen.getByText(/Certo!/)).toBeVisible();
});
