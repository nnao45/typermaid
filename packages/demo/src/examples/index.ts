export const EXAMPLE_FLOWCHARTS = [
  {
    id: 'basic',
    title: 'Basic Flowchart',
    code: `flowchart TB
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,
  },
  {
    id: 'complex',
    title: 'Complex Flowchart',
    code: `flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
    E --> F((Circle))
    F --> G[(Database)]`,
  },
  {
    id: 'subgraph',
    title: 'Subgraph Example',
    code: `flowchart TB
    c1-->a2
    subgraph one
    a1-->a2
    end
    subgraph two
    b1-->b2
    end
    subgraph three
    c1-->c2
    end`,
  },
];

export const EXAMPLE_SEQUENCE = [
  {
    id: 'basic-seq',
    title: 'Basic Sequence',
    code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!`,
  },
  {
    id: 'loop-seq',
    title: 'Sequence with Loop',
    code: `sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    loop Healthcheck
        Bob->>Bob: Fight against hypochondria
    end
    Bob-->>Alice: Great!`,
  },
];

export const EXAMPLE_CLASS = [
  {
    id: 'basic-class',
    title: 'Basic Class Diagram',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    class Duck{
      +String beakColor
      +swim()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }`,
  },
];

export const EXAMPLE_ER = [
  {
    id: 'basic-er',
    title: 'Basic ER Diagram',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  },
];

export const EXAMPLE_STATE = [
  {
    id: 'basic-state',
    title: 'Basic State Diagram',
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
];

export const EXAMPLE_GANTT = [
  {
    id: 'basic-gantt',
    title: 'Basic Gantt Chart',
    code: `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
    A task :a1, 2014-01-01, 30d
    Another task :after a1, 20d
    section Another
    Task in sec :2014-01-12, 12d
    another task :24d`,
  },
];

export const ALL_EXAMPLES = [
  ...EXAMPLE_FLOWCHARTS,
  ...EXAMPLE_SEQUENCE,
  ...EXAMPLE_CLASS,
  ...EXAMPLE_ER,
  ...EXAMPLE_STATE,
  ...EXAMPLE_GANTT,
];
