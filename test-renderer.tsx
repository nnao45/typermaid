import { MermaidDiagram } from '@lyric-js/react-renderer';

const code = `
flowchart TB
  A[Start] --> B{Decision}
  B -->|Yes| C[OK]
  B -->|No| D[Error]
  C --> E[End]
  D --> E
`;

export const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Lyric-JS React Renderer Demo</h1>
      <MermaidDiagram
        code={code}
        width={800}
        height={600}
        theme="light"
        interactive={true}
        onNodeClick={(node) => console.log('Node clicked:', node)}
        onEdgeClick={(edge) => console.log('Edge clicked:', edge)}
      />
    </div>
  );
};
