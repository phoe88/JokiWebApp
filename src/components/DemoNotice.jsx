import DemoTag from './DemoTag';

/** The tag runs inline with the sentence, so it stays beside the text at any width. */
export default function DemoNotice({ tag, children }) {
  return (
    <p className="glass-soft mt-5 p-3 text-sm leading-relaxed text-ink-muted">
      <DemoTag>{tag}</DemoTag>
      <span className="ml-2.5">{children}</span>
    </p>
  );
}
