export interface ExampleData {
  input: string;
  output: string;
  explanation?: string;
}

interface ExampleBlockProps {
  index: number;
  example: ExampleData;
}

export default function ExampleBlock({ index, example }: ExampleBlockProps) {
  return (
    <div className="bg-primary/5 rounded-lg p-3 mb-3 border border-border">
      <div className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
        Example {index}
      </div>
      <div className="font-mono text-[13px] leading-relaxed">
        <div className="mb-1">
          <span className="text-muted-foreground font-semibold">Input:</span>{' '}
          <span className="text-primary">{example.input}</span>
        </div>
        <div className="mb-1">
          <span className="text-muted-foreground font-semibold">Output:</span>{' '}
          <span className="text-emerald-500 font-semibold">{example.output}</span>
        </div>
        {example.explanation && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground font-semibold">Explanation:</span>{' '}
            <span className="text-secondary-foreground text-xs">{example.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
