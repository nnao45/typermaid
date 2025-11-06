import { describe, it, expect } from "vitest";
import { parse } from "@typermaid/parser";
import { generateCode, generateFlowchart } from "../src/index.js";

describe("generateFlowchart", () => {
	it("should generate simple flowchart", () => {
		const code = `flowchart LR
  A --> B`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("flowchart LR");
		expect(generated).toContain("A --> B");
	});

	it("should generate nodes with labels", () => {
		const code = `flowchart TD
  A[Start] --> B[Process]`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("A[Start]");
		expect(generated).toContain("B[Process]");
	});

	it("should generate nodes with different shapes", () => {
		const code = `flowchart LR
  A[Rectangle]
  B(Rounded)
  C{Diamond}
  D((Circle))`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("A[Rectangle]");
		expect(generated).toContain("B(Rounded)");
		expect(generated).toContain("C{Diamond}");
		expect(generated).toContain("D((Circle))");
	});

	it("should generate edges with labels", () => {
		const code = `flowchart LR
  A -->|Yes| B
  B -->|No| C`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("|Yes|");
		expect(generated).toContain("|No|");
	});

	it("should generate subgraphs", () => {
		const code = `flowchart LR
  subgraph sub1
    A --> B
  end`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("subgraph sub1");
		expect(generated).toContain("end");
	});

	it("should preserve direction", () => {
		const directions = ["LR", "RL", "TD", "BT"];

		for (const dir of directions) {
			const code = `flowchart ${dir}\n  A --> B`;
			const ast = parse(code);
			const generated = generateCode(ast);

			expect(generated).toContain(`flowchart ${dir}`);
		}
	});

	it("should handle round-trip transformation", () => {
		const original = `flowchart LR
  A[Start] --> B[Process]
  B --> C[End]`;

		const ast = parse(original);
		const generated = generateCode(ast);

		// Parse again to verify it's valid
		const ast2 = parse(generated);

		expect(ast2.body[0].type).toBe("FlowchartDiagram");
	});
});

describe("generateCode - Multiple diagrams", () => {
	it("should handle multiple diagrams", () => {
		const code = `flowchart LR
  A --> B

sequenceDiagram
  Alice->>Bob: Hello`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("flowchart LR");
		expect(generated).toContain("sequenceDiagram");
		expect(generated).toContain("Alice->>Bob");
	});
});
