"use client";

import { useMemo, useReducer } from "react";
import {
  type DiagnosisInput,
  type JobId,
  type MBTI16,
  type PriorityId,
  type TaskId,
} from "@/types/recommender";
import { serializeInput } from "@/lib/url-state";

export type Step = 1 | 2 | 3 | 4;

type State = {
  step: Step;
  mbti: MBTI16 | null;
  jobs: JobId[];
  tasks: TaskId[];
  priorities: PriorityId[];
};

type Action =
  | { type: "SET_MBTI"; mbti: MBTI16 }
  | { type: "SET_JOBS"; jobs: JobId[] }
  | { type: "SET_TASKS"; tasks: TaskId[] }
  | { type: "SET_PRIORITIES"; priorities: PriorityId[] }
  | { type: "NEXT" }
  | { type: "PREV" };

const initialState: State = {
  step: 1,
  mbti: null,
  jobs: [],
  tasks: [],
  priorities: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_MBTI":
      return { ...state, mbti: action.mbti };
    case "SET_JOBS":
      return { ...state, jobs: action.jobs };
    case "SET_TASKS":
      return { ...state, tasks: action.tasks };
    case "SET_PRIORITIES":
      return { ...state, priorities: action.priorities };
    case "NEXT":
      return { ...state, step: Math.min(4, state.step + 1) as Step };
    case "PREV":
      return { ...state, step: Math.max(1, state.step - 1) as Step };
  }
}

export function useDiagnosis() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 1:
        return state.mbti !== null;
      case 2:
        return state.jobs.length > 0;
      case 3:
        return state.tasks.length > 0;
      case 4:
        return state.priorities.length > 0;
    }
  }, [state]);

  const resultPath = useMemo(() => {
    if (
      state.mbti === null ||
      state.jobs.length === 0 ||
      state.tasks.length === 0 ||
      state.priorities.length === 0
    ) {
      return null;
    }
    const input: DiagnosisInput = {
      mbti: state.mbti,
      jobs: state.jobs,
      tasks: state.tasks,
      priorities: state.priorities,
    };
    return `/result?${serializeInput(input)}`;
  }, [state]);

  return {
    ...state,
    canAdvance,
    isLastStep: state.step === 4,
    resultPath,
    setMbti: (mbti: MBTI16) => dispatch({ type: "SET_MBTI", mbti }),
    setJobs: (jobs: JobId[]) => dispatch({ type: "SET_JOBS", jobs }),
    setTasks: (tasks: TaskId[]) => dispatch({ type: "SET_TASKS", tasks }),
    setPriorities: (priorities: PriorityId[]) =>
      dispatch({ type: "SET_PRIORITIES", priorities }),
    next: () => dispatch({ type: "NEXT" }),
    prev: () => dispatch({ type: "PREV" }),
  };
}
