import type { Participant, SequenceDiagram, SequenceStatement } from '@typermaid/core';
import { measureTextCanvas } from '@typermaid/renderer-core';
import type React from 'react';
import type { Theme } from '../themes/types';

/**
 * Extract string value from Content type
 */
function contentToString(content: string | { type: string; raw: string } | undefined): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

interface SequenceRendererProps {
  diagram: SequenceDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const SequenceRenderer: React.FC<SequenceRendererProps> = ({
  diagram,
  theme,
  width = 800,
}) => {
  const statements = diagram.statements || [];

  // Extract participants from all statements
  const participantsMap = new Map<string, Participant>();

  const extractParticipants = (stmts: SequenceStatement[]) => {
    for (const stmt of stmts) {
      if (stmt.type === 'participant') {
        participantsMap.set(stmt.id, stmt);
      } else if (stmt.type === 'message') {
        if (!participantsMap.has(stmt.from)) {
          participantsMap.set(stmt.from, { type: 'participant', id: stmt.from });
        }
        if (!participantsMap.has(stmt.to)) {
          participantsMap.set(stmt.to, { type: 'participant', id: stmt.to });
        }
      }

      // Recursively extract from nested blocks
      if ('statements' in stmt && Array.isArray(stmt.statements)) {
        extractParticipants(stmt.statements);
      }
      if ('elseBlocks' in stmt && Array.isArray(stmt.elseBlocks)) {
        for (const block of stmt.elseBlocks) {
          if (Array.isArray(block.statements)) {
            extractParticipants(block.statements);
          }
        }
      }
      if ('andBlocks' in stmt && Array.isArray(stmt.andBlocks)) {
        for (const block of stmt.andBlocks) {
          if (Array.isArray(block.statements)) {
            extractParticipants(block.statements);
          }
        }
      }
      if ('optionBlocks' in stmt && Array.isArray(stmt.optionBlocks)) {
        for (const block of stmt.optionBlocks) {
          if (Array.isArray(block.statements)) {
            extractParticipants(block.statements);
          }
        }
      }
    }
  };

  extractParticipants(statements);

  const participants = Array.from(participantsMap.values());

  // Dynamic sizing based on text measurement
  const fontSize = 14;
  const padding = 20;
  const participantHeight = 40;
  const participantSpacing = 60;
  const messageSpacing = 60;
  const topMargin = 50;
  const leftMargin = 50;
  const fragmentHeaderHeight = 30;
  const fragmentPadding = 10;

  // Measure each participant's text width
  const participantWidths = participants.map((p) => {
    const text = p.alias || p.id;
    const metrics = measureTextCanvas(text, fontSize, 'sans-serif', 'normal');
    return Math.max(metrics.width + padding * 2, 100);
  });

  const participantWidth = Math.max(...participantWidths, 120);

  const totalWidth =
    width || participants.length * (participantWidth + participantSpacing) + leftMargin * 2;

  // Render statements with Y coordinate tracking
  let currentY = topMargin + participantHeight;
  const elements: JSX.Element[] = [];
  let elementKey = 0;

  const getParticipantX = (participantId: string): number => {
    const index = participants.findIndex((p) => p.id === participantId);
    if (index === -1) return leftMargin;
    return leftMargin + index * (participantWidth + participantSpacing) + participantWidth / 2;
  };

  const renderStatements = (stmts: SequenceStatement[], depth: number = 0): number => {
    let localY = currentY;

    for (const stmt of stmts) {
      if (stmt.type === 'message') {
        // Render message
        const x1 = getParticipantX(stmt.from);
        const x2 = getParticipantX(stmt.to);
        const y = localY + messageSpacing;

        // Check if this is a self-message (same participant)
        if (stmt.from === stmt.to) {
          // Draw loopback arrow for self-message
          const loopWidth = 60;
          const loopHeight = 40;

          elements.push(
            <g key={`msg-${elementKey++}`}>
              <path
                d={`M ${x1} ${y} L ${x1 + loopWidth} ${y} L ${x1 + loopWidth} ${y + loopHeight} L ${x1} ${y + loopHeight}`}
                fill="none"
                stroke={theme.colors.edge.stroke}
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={x1 + loopWidth + 10}
                y={y + loopHeight / 2}
                fill={theme.colors.text}
                fontSize={12}
                textAnchor="start"
              >
                {contentToString(stmt.text) || ''}
              </text>
            </g>
          );

          localY = y + loopHeight;
        } else {
          // Draw regular arrow between different participants
          elements.push(
            <g key={`msg-${elementKey++}`}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={theme.colors.edge.stroke}
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={(x1 + x2) / 2}
                y={y - 5}
                fill={theme.colors.text}
                fontSize={12}
                textAnchor="middle"
              >
                {contentToString(stmt.text) || ''}
              </text>
            </g>
          );

          localY = y;
        }
      } else if (stmt.type === 'note') {
        // Render note
        const noteWidth = 150;
        const noteHeight = 60;
        const y = localY + messageSpacing;

        const actorIndices = stmt.actors
          .map((actorId) => participants.findIndex((p) => p.id === actorId))
          .filter((idx) => idx !== -1);

        if (actorIndices.length > 0) {
          let noteX = 0;

          if (stmt.position === 'left') {
            const actorIndex = actorIndices[0] ?? 0;
            noteX =
              leftMargin + actorIndex * (participantWidth + participantSpacing) - noteWidth - 20;
          } else if (stmt.position === 'right') {
            const actorIndex = actorIndices[0] ?? 0;
            noteX =
              leftMargin +
              actorIndex * (participantWidth + participantSpacing) +
              participantWidth +
              20;
          } else if (stmt.position === 'over') {
            const minIndex = Math.min(...actorIndices);
            const maxIndex = Math.max(...actorIndices);
            const startX = leftMargin + minIndex * (participantWidth + participantSpacing);
            const endX =
              leftMargin + maxIndex * (participantWidth + participantSpacing) + participantWidth;
            noteX = (startX + endX) / 2 - noteWidth / 2;
          }

          elements.push(
            <g key={`note-${elementKey++}`}>
              <rect
                x={noteX}
                y={y}
                width={noteWidth}
                height={noteHeight}
                fill="#fffacd"
                stroke="#f0e68c"
                strokeWidth={2}
                rx={3}
              />
              <text
                x={noteX + noteWidth / 2}
                y={y + noteHeight / 2}
                fill="#333"
                fontSize={11}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {contentToString(stmt.text)}
              </text>
            </g>
          );

          localY = y + noteHeight / 2;
        }
      } else if (stmt.type === 'loop' || stmt.type === 'opt' || stmt.type === 'break') {
        // Render simple fragments (loop, opt, break)
        const fragmentStartY = localY + messageSpacing;
        const fragmentLabel = stmt.type === 'loop' ? 'loop' : stmt.type === 'opt' ? 'opt' : 'break';
        const condition = 'condition' in stmt ? stmt.condition : undefined;

        // Save current Y for fragment start
        const fragmentY = fragmentStartY;

        // Calculate fragment dimensions first
        const fragmentWidth = totalWidth - leftMargin * 2;
        const fragmentBoxKey = elementKey++;

        // Render fragment rectangle BEFORE inner content
        const fragmentRectangle = (height: number) => (
          <g key={`fragment-${fragmentBoxKey}`}>
            <rect
              x={leftMargin}
              y={fragmentY}
              width={fragmentWidth}
              height={height}
              fill="none"
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            {/* Fragment header */}
            <rect
              x={leftMargin}
              y={fragmentY}
              width={120}
              height={fragmentHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.1}
            />
            <text
              x={leftMargin + 10}
              y={fragmentY + fragmentHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
              dominantBaseline="middle"
            >
              {fragmentLabel}
              {condition ? ` [${condition}]` : ''}
            </text>
          </g>
        );

        // Temporarily store current elements count
        const beforeInnerElements = elements.length;

        // Render inner statements
        currentY = fragmentStartY + fragmentHeaderHeight;
        const innerStatements = 'statements' in stmt ? stmt.statements : [];
        const innerEndY = renderStatements(innerStatements, depth + 1);

        // Calculate fragment height
        const fragmentHeight = innerEndY - fragmentStartY + fragmentPadding * 2;

        // Insert fragment rectangle BEFORE the inner elements
        elements.splice(beforeInnerElements, 0, fragmentRectangle(fragmentHeight));

        localY = innerEndY + fragmentPadding;
      } else if (stmt.type === 'alt') {
        // Render alt fragment with else blocks
        const fragmentStartY = localY + messageSpacing;
        const fragmentY = fragmentStartY;

        // Render main block
        currentY = fragmentStartY + fragmentHeaderHeight;
        const mainEndY = renderStatements(stmt.statements, depth + 1);

        let blockY = mainEndY;

        // Render else blocks
        for (const elseBlock of stmt.elseBlocks) {
          // Draw separator line
          const fragmentWidth = totalWidth - leftMargin * 2;
          elements.push(
            <line
              key={`separator-${elementKey++}`}
              x1={leftMargin}
              y1={blockY}
              x2={leftMargin + fragmentWidth}
              y2={blockY}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          );

          // Render else label
          elements.push(
            <text
              key={`else-label-${elementKey++}`}
              x={leftMargin + 10}
              y={blockY + 20}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
            >
              else{elseBlock.condition ? ` [${elseBlock.condition}]` : ''}
            </text>
          );

          currentY = blockY + 30;
          blockY = renderStatements(elseBlock.statements, depth + 1);
        }

        // Calculate total fragment height
        const fragmentHeight = blockY - fragmentStartY + fragmentPadding * 2;
        const fragmentWidth = totalWidth - leftMargin * 2;

        // Render fragment rectangle
        elements.push(
          <g key={`fragment-${elementKey++}`}>
            <rect
              x={leftMargin}
              y={fragmentY}
              width={fragmentWidth}
              height={fragmentHeight}
              fill="none"
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <rect
              x={leftMargin}
              y={fragmentY}
              width={120}
              height={fragmentHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.1}
            />
            <text
              x={leftMargin + 10}
              y={fragmentY + fragmentHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
              dominantBaseline="middle"
            >
              alt{stmt.condition ? ` [${stmt.condition}]` : ''}
            </text>
          </g>
        );

        localY = blockY + fragmentPadding;
      } else if (stmt.type === 'par') {
        // Render par fragment with and blocks
        const fragmentStartY = localY + messageSpacing;
        const fragmentY = fragmentStartY;

        currentY = fragmentStartY + fragmentHeaderHeight;
        const mainEndY = renderStatements(stmt.statements, depth + 1);

        let blockY = mainEndY;

        for (const andBlock of stmt.andBlocks) {
          const fragmentWidth = totalWidth - leftMargin * 2;
          elements.push(
            <line
              key={`separator-${elementKey++}`}
              x1={leftMargin}
              y1={blockY}
              x2={leftMargin + fragmentWidth}
              y2={blockY}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          );

          elements.push(
            <text
              key={`and-label-${elementKey++}`}
              x={leftMargin + 10}
              y={blockY + 20}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
            >
              and{andBlock.condition ? ` [${andBlock.condition}]` : ''}
            </text>
          );

          currentY = blockY + 30;
          blockY = renderStatements(andBlock.statements, depth + 1);
        }

        const fragmentHeight = blockY - fragmentStartY + fragmentPadding * 2;
        const fragmentWidth = totalWidth - leftMargin * 2;

        elements.push(
          <g key={`fragment-${elementKey++}`}>
            <rect
              x={leftMargin}
              y={fragmentY}
              width={fragmentWidth}
              height={fragmentHeight}
              fill="none"
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <rect
              x={leftMargin}
              y={fragmentY}
              width={120}
              height={fragmentHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.1}
            />
            <text
              x={leftMargin + 10}
              y={fragmentY + fragmentHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
              dominantBaseline="middle"
            >
              par{stmt.condition ? ` [${stmt.condition}]` : ''}
            </text>
          </g>
        );

        localY = blockY + fragmentPadding;
      } else if (stmt.type === 'critical') {
        // Render critical fragment with option blocks
        const fragmentStartY = localY + messageSpacing;
        const fragmentY = fragmentStartY;

        currentY = fragmentStartY + fragmentHeaderHeight;
        const mainEndY = renderStatements(stmt.statements, depth + 1);

        let blockY = mainEndY;

        for (const optionBlock of stmt.optionBlocks) {
          const fragmentWidth = totalWidth - leftMargin * 2;
          elements.push(
            <line
              key={`separator-${elementKey++}`}
              x1={leftMargin}
              y1={blockY}
              x2={leftMargin + fragmentWidth}
              y2={blockY}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          );

          elements.push(
            <text
              key={`option-label-${elementKey++}`}
              x={leftMargin + 10}
              y={blockY + 20}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
            >
              option{optionBlock.condition ? ` [${optionBlock.condition}]` : ''}
            </text>
          );

          currentY = blockY + 30;
          blockY = renderStatements(optionBlock.statements, depth + 1);
        }

        const fragmentHeight = blockY - fragmentStartY + fragmentPadding * 2;
        const fragmentWidth = totalWidth - leftMargin * 2;

        elements.push(
          <g key={`fragment-${elementKey++}`}>
            <rect
              x={leftMargin}
              y={fragmentY}
              width={fragmentWidth}
              height={fragmentHeight}
              fill="none"
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <rect
              x={leftMargin}
              y={fragmentY}
              width={120}
              height={fragmentHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.1}
            />
            <text
              x={leftMargin + 10}
              y={fragmentY + fragmentHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
              dominantBaseline="middle"
            >
              critical{stmt.condition ? ` [${stmt.condition}]` : ''}
            </text>
          </g>
        );

        localY = blockY + fragmentPadding;
      } else if (stmt.type === 'rect') {
        // Render rect fragment
        const fragmentStartY = localY + messageSpacing;
        const fragmentY = fragmentStartY;

        currentY = fragmentStartY + fragmentHeaderHeight;
        const innerEndY = renderStatements(stmt.statements, depth + 1);

        const fragmentHeight = innerEndY - fragmentStartY + fragmentPadding * 2;
        const fragmentWidth = totalWidth - leftMargin * 2;

        elements.push(
          <g key={`fragment-${elementKey++}`}>
            <rect
              x={leftMargin}
              y={fragmentY}
              width={fragmentWidth}
              height={fragmentHeight}
              fill={stmt.color || 'transparent'}
              fillOpacity={0.1}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <rect
              x={leftMargin}
              y={fragmentY}
              width={120}
              height={fragmentHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.1}
            />
            <text
              x={leftMargin + 10}
              y={fragmentY + fragmentHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="bold"
              dominantBaseline="middle"
            >
              rect{stmt.color ? ` [${stmt.color}]` : ''}
            </text>
          </g>
        );

        localY = innerEndY + fragmentPadding;
      }
    }

    return localY;
  };

  // Render all statements
  const finalY = renderStatements(statements);
  const totalHeight = finalY + 100;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
      </defs>

      {/* Render participants */}
      {participants.map((participant: Participant, index: number) => {
        const x = leftMargin + index * (participantWidth + participantSpacing);
        const y = topMargin;

        return (
          <g key={participant.id || index}>
            <rect
              x={x}
              y={y}
              width={participantWidth}
              height={participantHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <text
              x={x + participantWidth / 2}
              y={y + participantHeight / 2}
              fill={theme.colors.text}
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {participant.alias || participant.id}
            </text>
            <line
              x1={x + participantWidth / 2}
              y1={y + participantHeight}
              x2={x + participantWidth / 2}
              y2={totalHeight - 50}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          </g>
        );
      })}

      {/* Render all collected elements */}
      {elements}
    </svg>
  );
};
