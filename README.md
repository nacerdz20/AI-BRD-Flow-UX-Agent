# AI-BRD-Flow-UX-Agent

`AI-BRD-Flow-UX-Agent` is a lightweight `Vite + React + TypeScript` web app, developed by `زوايزية الناصر (Nacer Zouaizia)`, that turns a raw digital product idea into a structured analysis package.

The project still focuses on three core outcomes:

- BRD
- Flowcharts
- UI/UX

It does **not** generate implementation code for the target product. It generates analysis artifacts for product, design, engineering, and QA handoff.

## What Changed

The system now behaves more like a real analysis team instead of a single generic generator.

New professional layers include:

- `Clarification Agent` before BRD generation
- structured functional requirements with `MoSCoW` prioritization
- structured non-functional requirements
- structured user-story generation inside the `UX Architect Agent`
- `Requirements Traceability Matrix`
- `Mermaid Validator` and auto-repair layer
- screen-to-requirement and screen-to-user-story mapping
- numeric `Quality Score`
- project-type templates
- multiple export formats
- simple analysis versioning
- professional mock scenarios for testing without an API key
- Mermaid rendering inside the in-app final report

## Agent Pipeline

The current orchestration order is:

1. `Clarification Agent`
2. `Business Analyst Agent`
3. `Process Flow Agent`
4. `UX Architect Agent`
5. `UI Designer Agent`
6. `Quality Reviewer Agent`

Supporting services then assemble:

- requirements traceability
- export bundles
- version history

## Project Types

The clarification layer detects and templates the analysis around:

- `SaaS`
- `E-commerce`
- `Booking Platform`
- `Marketplace`
- `CRM`
- `ERP`
- `Education Platform`
- `Admin Dashboard`
- `Mobile App`

Each template can inject project-specific features, flow hints, screens, and assumptions.

## Structured Output

The final internal JSON includes:

```json
{
  "projectType": "",
  "clarification": {
    "missingInformation": [],
    "questions": [],
    "assumptions": []
  },
  "prioritizedRequirements": {
    "mustHave": [],
    "shouldHave": [],
    "couldHave": [],
    "wontHaveNow": []
  },
  "userStories": [],
  "traceabilityMatrix": [],
  "qualityScore": {
    "brd": 0,
    "flowcharts": 0,
    "ux": 0,
    "ui": 0,
    "overall": 0
  },
  "exports": {
    "markdown": "",
    "json": "",
    "mermaid": ""
  },
  "version": {
    "number": "",
    "changesSummary": ""
  }
}
```

The actual `ProjectAnalysis` type is richer and also includes:

- BRD sections
- typed flowchart artifacts
- typed UI screens
- review strengths / weaknesses / recommendations
- version history

## Export Formats

The UI can export:

- full markdown report
- JSON output
- Mermaid flowcharts only
- BRD package only
- UI/UX specification only
- current open tab

The in-app tabs are now:

- `BRD`
- `Flowcharts`
- `UX`
- `UI`
- `Traceability Matrix`
- `Quality Review`
- `Final Report`

## Versioning

Each generated analysis now carries:

- version number
- original idea
- generation date
- changes summary
- generated output snapshot

If the user regenerates the analysis in the same session, the app appends a new version entry.

## Mermaid Validation

`src/services/mermaidValidator.ts` is responsible for:

- ensuring Mermaid starts with `flowchart TD` or `flowchart LR`
- sanitizing unsafe labels
- repairing simple syntax gaps
- returning render-ready Mermaid blocks

## Key Folders

```text
src/
  agents/
    clarificationAgent.ts
    businessAnalystAgent.ts
    processFlowAgent.ts
    uxArchitectAgent.ts
    userStoriesAgent.ts
    uiDesignerAgent.ts
    qualityReviewerAgent.ts
    orchestratorAgent.ts
  prompts/
    clarificationPrompt.ts
    brdPrompt.ts
    flowchartPrompt.ts
    uxPrompt.ts
    userStoriesPrompt.ts
    uiPrompt.ts
    reviewerPrompt.ts
    orchestratorPrompt.ts
  services/
    projectContext.ts
    projectTemplates.ts
    mermaidValidator.ts
    mockData.ts
    requirements.ts
    traceability.ts
    versioning.ts
    exportMarkdown.ts
    llmProvider.ts
```

## Run Locally

From the workspace root:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## LLM Provider

The project is still mock-first. Replace the implementation in:

- `src/services/llmProvider.ts`

For quick testing without any API key, use the built-in mock scenarios in:

- `src/services/mockData.ts`

Keep this function contract stable:

```ts
generateWithLLM(prompt: string): Promise<string>
```

That lets you swap in `OpenAI`, `Ollama`, or another provider later without changing the agent pipeline.
