import { expect, test } from "@playwright/test";

const KNOWN_MODELS =
  /Claude Opus 4\.7|Claude Haiku 4\.5|GPT-5|GPT-4o mini|Gemini 2\.5 Pro/;

test.describe("LLM-MBTI Recommender", () => {
  test("walks through all 4 steps and shows a recommendation", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1 — MBTI
    await expect(page.getByText("당신의 MBTI는?")).toBeVisible();
    await page.getByRole("radio", { name: "INTJ" }).click();
    await page.getByRole("button", { name: "다음 →" }).click();

    // Step 2 — jobs
    await expect(page.getByText("당신의 직무는?")).toBeVisible();
    await page.getByRole("button", { name: "인공지능" }).click();
    await page.getByRole("button", { name: "어플리케이션SW" }).click();
    await page.getByRole("button", { name: "다음 →" }).click();

    // Step 3 — tasks
    await expect(page.getByText("주로 어떤 작업을 하시나요?")).toBeVisible();
    await page.getByRole("button", { name: "코드 작성·리뷰" }).click();
    await page.getByRole("button", { name: "기술 리서치·학습" }).click();
    await page.getByRole("button", { name: "다음 →" }).click();

    // Step 4 — priorities
    await expect(page.getByText("무엇이 가장 중요한가요?")).toBeVisible();
    await page.getByRole("button", { name: "정확성" }).click();
    await page.getByRole("button", { name: "창의성" }).click();
    await page.getByRole("button", { name: "결과 보기" }).click();

    // Result page
    await expect(page).toHaveURL(/\/result\?mbti=INTJ/);
    await expect(page.getByText("당신의 진단")).toBeVisible();
    await expect(page.locator("body")).toContainText(KNOWN_MODELS);
    await expect(page.locator("body")).toContainText("INTJ");
    await expect(page.locator("body")).toContainText("인공지능");
  });

  test("redirects an invalid result URL back to the diagnose page", async ({
    page,
  }) => {
    await page.goto(
      "/result?mbti=ZZZZ&jobs=ai&tasks=code&priorities=accuracy",
    );
    await expect(page).toHaveURL("/");
    await expect(page.getByText("당신의 MBTI는?")).toBeVisible();
  });

  test("'다시 진단하기' returns to step 1 with no MBTI selected", async ({
    page,
  }) => {
    await page.goto(
      "/result?mbti=INTJ&jobs=ai&tasks=code&priorities=accuracy",
    );
    await page.getByRole("link", { name: "다시 진단하기" }).click();
    await expect(page).toHaveURL("/");
    const intjCard = page.getByRole("radio", { name: "INTJ" });
    await expect(intjCard).toHaveAttribute("aria-checked", "false");
  });

  test("copies the system prompt to the clipboard on '복사' click", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(
      "/result?mbti=INTJ&jobs=ai&tasks=code&priorities=accuracy",
    );
    const promptText = await page.locator("pre").first().textContent();
    await page
      .getByRole("button", { name: "시스템 프롬프트 복사" })
      .click();
    await expect(
      page.getByRole("button", { name: "시스템 프롬프트 복사" }),
    ).toContainText("복사됨");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(promptText);
  });

  test("OG image route responds with an image for valid params", async ({
    page,
  }) => {
    const response = await page.request.get(
      "/og?mbti=INTJ&main=claude-opus",
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image");
  });
});
