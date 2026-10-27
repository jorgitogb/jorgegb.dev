---
title: "Vertical slices with an AI pair: how I build my side projects"
date: "2026-10-27"
description: "Why I stopped writing full specs for my own projects, and the small loop of one-line stories, vertical slices and test-by-test AI pair programming that replaced them."
tags: ["workflow", "ai-coding", "testing"]
---

I used to plan my personal projects the way big teams do: requirements first, then a design, then a task list, then hand it all to an AI agent and review the result. It looked professional. It also kept going wrong in the same ways, so I changed how I work. This post describes what I do now and why.

## What went wrong with spec-first

Spec-driven development is built for handing work over, between people or between a person and an agent. For my own projects I am not handing anything over; I am programming. In that setting the problems chained together:

- **The plan is written when I know the least.** By the fifth step, what I specified in the first is often wrong or not needed.
- **Tasks come out by layer.** First the database, then the API, then the UI. Nothing can be used until the end, so nothing can be checked by using it.
- **The AI fills every gap.** Unneeded interfaces, extra fields and "future-proof" layers appear because the spec left room for them.
- **The only review left is reading.** A 3,000-line pull request gets either hours of attention or a click on "approve". Code I did not review is not really mine.

## The replacement: three small ideas

### 1. A backlog of one-line stories

Each card is one sentence: *As a visitor I want … so that …*. The "so that" is the filter. If I cannot name the benefit, I probably do not need the card. A one-line story costs nothing to write and nothing to drop, so I reorder and delete freely. Technical detail is the expensive part, so I leave it until I pick the story up.

### 2. One vertical slice at a time

A slice is one small feature that crosses every layer it needs and is usable when it is done. "Add the database table" is not a slice; "a visitor can read a post on its own page" is. When a slice is finished, something works, and I verify it by using it.

For data and pipeline work the same idea holds: a slice is input, transformation and an inspectable output, run on a small sample.

### 3. AI pair programming, with me as navigator

In pair programming the driver types and the navigator decides. I give the typing to the AI and keep the deciding. The AI writes **one test**, runs it, and stops so I can read it. Tests are the spec, so I review them closely. Only after I agree does it write the smallest code that makes the test pass. Then it stops again, and I skim a diff of a few dozen lines and commit.

```text
test (red) → I review the test → minimal code (green) → I skim the diff → commit
```

Because every step is committed, any later edit to an existing test shows up in the diff.

## Three alarms

I watch for three failure modes and stop the session when I see one:

1. **Loops.** The same failure again and again, or a third approach to one test.
2. **Scope creep.** Anything the current test did not need: extra fields, helpers, options.
3. **Test tampering.** Editing, skipping or loosening a test to get to green. Tests are sacred; if one looks wrong, we stop and talk about it.

## Keeping the process light

A few rules keep this from turning back into paperwork:

- **One page of hard-to-change things.** Vision, non-goals and constraints such as domain, hosting and data identity live on one page per project. This is the only planning I do up front.
- **Conventions live in the repo.** When I make a structural decision, it becomes one line in the repository's `CLAUDE.md`, so a new session starts with it.
- **Refactor on purpose.** At the end of a story the AI lists at most three refactor candidates. I pick some or none, and each one gets its own commit on green.
- **Spikes for unknowns.** When the question is "how does this work?", I time-box a spike with throwaway code and no tests. The result is a note and new stories, never merged code.
- **One branch per story, squash-merged.** Small commits on the branch, one clean commit per story on the main branch.

## What this looks like on this site

This website is built the same way. Its backlog is a Kanban board with one-line cards, and each recent change was a single story: fixing contrast, adding security headers, removing placeholder posts. Each one had acceptance criteria written as Given/When/Then, a short test list, and a test that failed for the right reason before any code was written. The post you are reading is the slice that replaced the "coming soon" placeholder on the blog.

## When I do not use it

This is for my own projects. In team repositories I follow the team's process, whether that is specs, issue templates or pull request rules. The small steps and frequent commits still apply, but the structure belongs to the team.

## What I take from it

The AI saves me typing, not thinking. To say "no" to it I have to know what I want, and small tested steps are what let me keep knowing. I get fewer documents, fewer layers and software that works after every slice.
