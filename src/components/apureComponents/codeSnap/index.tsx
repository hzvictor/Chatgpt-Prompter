import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default ({ lang, codeString }: any) => {
  //     const codeString = `<SyntaxHighlighter language="javascript" style={dark}>
  //     {codeString}
  // </SyntaxHighlighter>`;
  return (
    <SyntaxHighlighter language={lang} wrapLines={true} style={a11yDark}>
      {codeString}
    </SyntaxHighlighter>
  );
};
