import { describe, it, expect } from "vitest";
import { parse } from "@lyric-js/parser";
import { generateCode } from "../src/index.js";

describe("generateClass", () => {
	it("should generate simple class diagram", () => {
		const code = `classDiagram
  class Animal
  class Dog`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("classDiagram");
		expect(generated).toContain("class Animal");
		expect(generated).toContain("class Dog");
	});

	it("should generate class with members", () => {
		const code = `classDiagram
  class Animal {
    +String name
    +void makeSound()
  }`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("class Animal");
		expect(generated).toContain("{");
		expect(generated).toContain("}");
	});

	it("should generate relationships", () => {
		const code = `classDiagram
  Animal <|-- Dog
  Animal <|-- Cat`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("<|--");
	});

	it("should generate relationships with labels", () => {
		const code = `classDiagram
  Driver "1" --> "0..*" Car : drives`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("drives");
	});
});

describe("generateER", () => {
	it("should generate simple ER diagram with relationship", () => {
		const code = `erDiagram
  CUSTOMER ||--o{ ORDER : places`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("erDiagram");
		expect(generated).toContain("CUSTOMER");
		expect(generated).toContain("ORDER");
		expect(generated).toContain("places");
	});

	it("should generate entities with attributes", () => {
		const code = `erDiagram
  CUSTOMER {
    string name
    int age
  }`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("CUSTOMER");
		expect(generated).toContain("{");
		expect(generated).toContain("}");
	});

	it("should generate attributes with keys", () => {
		const code = `erDiagram
  CUSTOMER {
    string id PK
    string name
  }`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("PK");
	});

	it("should generate relationships", () => {
		const code = `erDiagram
  CUSTOMER ||--o{ ORDER : places`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("CUSTOMER");
		expect(generated).toContain("ORDER");
		expect(generated).toContain("places");
	});
});

describe("generateGantt", () => {
	it("should generate simple gantt chart", () => {
		const code = `gantt
  title Project Timeline
  dateFormat YYYY-MM-DD
  section Development
  Design :2024-01-01, 5d`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("gantt");
		expect(generated).toContain("title Project Timeline");
		expect(generated).toContain("dateFormat YYYY-MM-DD");
	});

	it("should generate sections", () => {
		const code = `gantt
  section Development
  Task A :2024-01-01, 5d
  section Testing
  Task B :2024-01-06, 3d`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("section Development");
		expect(generated).toContain("section Testing");
	});

	it("should generate tasks with status", () => {
		const code = `gantt
  section Work
  Done task :done, 2024-01-01, 5d
  Active task :active, 2024-01-06, 3d`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("done");
		expect(generated).toContain("active");
	});

	it("should generate tasks with dependencies", () => {
		const code = `gantt
  section Dev
  Task A :a1, 2024-01-01, 5d
  Task B :after a1, 3d`;

		const ast = parse(code);
		const generated = generateCode(ast);

		expect(generated).toContain("a1");
	});
});

describe("Round-trip tests", () => {
	it("should handle flowchart round-trip", () => {
		const original = `flowchart LR
  A[Start] --> B[End]`;

		const ast1 = parse(original);
		const generated = generateCode(ast1);
		const ast2 = parse(generated);

		expect(ast2.body[0].type).toBe("FlowchartDiagram");
	});

	it("should handle sequence round-trip", () => {
		const original = `sequenceDiagram
  Alice->>Bob: Hello`;

		const ast1 = parse(original);
		const generated = generateCode(ast1);
		const ast2 = parse(generated);

		expect(ast2.body[0].type).toBe("SequenceDiagram");
	});

	it("should handle state round-trip", () => {
		const original = `stateDiagram-v2
  [*] --> A
  A --> B`;

		const ast1 = parse(original);
		const generated = generateCode(ast1);
		const ast2 = parse(generated);

		expect(ast2.body[0].type).toBe("StateDiagram");
	});
});
