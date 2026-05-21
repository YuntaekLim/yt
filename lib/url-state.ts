import {
  MBTI16,
  JOB_IDS,
  TASK_IDS,
  PRIORITY_IDS,
  type DiagnosisInput,
  type JobId,
  type TaskId,
  type PriorityId,
} from "@/types/recommender";

const MBTI_SET = new Set<string>(MBTI16);
const JOB_SET = new Set<string>(JOB_IDS);
const TASK_SET = new Set<string>(TASK_IDS);
const PRIORITY_SET = new Set<string>(PRIORITY_IDS);

export type SearchParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getParam(params: SearchParamsLike, key: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseList<T extends string>(
  raw: string | undefined,
  allowed: Set<string>,
): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => allowed.has(s));
}

export function normalizeInput(input: DiagnosisInput): DiagnosisInput {
  return {
    mbti: input.mbti,
    jobs: [...input.jobs].sort(),
    tasks: [...input.tasks].sort(),
    priorities: [...input.priorities].sort(),
  };
}

export function parseInputFromSearchParams(
  params: SearchParamsLike,
): DiagnosisInput | null {
  const mbtiRaw = getParam(params, "mbti");
  if (!mbtiRaw || !MBTI_SET.has(mbtiRaw)) return null;

  const jobs = parseList<JobId>(getParam(params, "jobs"), JOB_SET);
  const tasks = parseList<TaskId>(getParam(params, "tasks"), TASK_SET);
  const priorities = parseList<PriorityId>(
    getParam(params, "priorities"),
    PRIORITY_SET,
  );

  if (jobs.length === 0 || tasks.length === 0 || priorities.length === 0) {
    return null;
  }

  return normalizeInput({
    mbti: mbtiRaw as DiagnosisInput["mbti"],
    jobs,
    tasks,
    priorities,
  });
}

export function serializeInput(input: DiagnosisInput): string {
  const n = normalizeInput(input);
  return [
    `mbti=${n.mbti}`,
    `jobs=${n.jobs.join(",")}`,
    `tasks=${n.tasks.join(",")}`,
    `priorities=${n.priorities.join(",")}`,
  ].join("&");
}
