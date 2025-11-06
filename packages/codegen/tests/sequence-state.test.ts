import { describe, it, expect } from "vitest";
import { parse } from "@typermaid/parser";
import { generateCode } from "../src/index.js";

describe("generateSequence", () => {
	it("should generate simple sequence diagram", () => {
		const code = `sequenceDiagram
  Alice->>Bob: Hello`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("sequenceDiagram");
		expect(generated).toContain("Alice->>Bob: Hello");
	});

	it("should generate participants", () => {
		const code = `sequenceDiagram
  participant A
  participant B as Bob
  A->>B: Hello`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("participant A");
		expect(generated).toContain("participant B as Bob");
	});

	it("should generate actors", () => {
		const code = `sequenceDiagram
  actor Alice
  actor Bob
  Alice->>Bob: Hi`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("actor Alice");
		expect(generated).toContain("actor Bob");
	});

	it("should generate loop blocks", () => {
		const code = `sequenceDiagram
  Alice->>Bob: Hello
  loop Every minute
    Bob->>Alice: Ping
  end`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("loop Every minute");
		expect(generated).toContain("end");
	});

	it("should generate alt/else blocks", () => {
		const code = `sequenceDiagram
  Alice->>Bob: Request
  alt Success
    Bob->>Alice: OK
  else Failure
    Bob->>Alice: Error
  end`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("alt Success");
		expect(generated).toContain("else Failure");
		expect(generated).toContain("end");
	});

	it("should generate notes", () => {
		const code = `sequenceDiagram
  Alice->>Bob: Hello
  note right of Alice: This is a note`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("note");
		expect(generated).toContain("Alice");
	});

	it("should handle different arrow types", () => {
		const code = `sequenceDiagram
  A->>B: Solid
  A-->>B: Dotted
  A->B: Open
  A-->B: Dotted open`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("->>"); // Solid arrow
		expect(generated).toContain("-->>"); // Dotted arrow
	});
});

describe("generateState", () => {
	it("should generate simple state diagram", () => {
		const code = `stateDiagram-v2
  [*] --> Idle
  Idle --> Active`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("stateDiagram-v2");
		expect(generated).toContain("[*] --> Idle");
		expect(generated).toContain("Idle --> Active");
	});

	it("should generate state descriptions", () => {
		const code = `stateDiagram-v2
  state1: This is state 1
  [*] --> state1`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("state1:");
	});

	it("should generate transitions with labels", () => {
		const code = `stateDiagram-v2
  [*] --> Idle
  Idle --> Active: start
  Active --> Idle: stop`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("Idle --> Active: start");
		expect(generated).toContain("Active --> Idle: stop");
	});

	it("should generate state notes", () => {
		const code = `stateDiagram-v2
  State1
  note right of State1: This is a note`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("note");
		expect(generated).toContain("State1");
	});

	it("should handle direction", () => {
		const code = `stateDiagram-v2
  direction LR
  [*] --> A`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("direction LR");
	});
});
