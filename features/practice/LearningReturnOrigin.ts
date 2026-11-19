import {createContext} from "react";
/** Navigation-only origin; never persisted or used as a progress owner. */
export const LearningReturnOrigin=createContext<"/learning/topics"|null>(null);
